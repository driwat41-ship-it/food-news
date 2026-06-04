import type { PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "../../../services/database/prisma";
import { logger } from "../../../lib/logger/structured-logger";
import { aiProcessingQueue, QUEUE_JOB_NAMES, rssProcessingQueue } from "../queues/rss.queues";
import type { AiProcessingJob, NormalizedArticleInput, ProcessArticleJob, RssSourceRecord } from "../types";
import { deduplicationService, DeduplicationService } from "./deduplication.service";
import { feedParserService, FeedParserService } from "./feed-parser.service";
import { rssFetcherService, RssFetcherService } from "./rss-fetcher.service";
import { rssMonitoringService, RssMonitoringService } from "./rss-monitoring.service";
import { rssSourceManager, RssSourceManager } from "./rss-source-manager.service";

export class ArticlePipelineService {
  constructor(
    private readonly prisma: PrismaClient = defaultPrisma,
    private readonly sourceManager: RssSourceManager = rssSourceManager,
    private readonly fetcher: RssFetcherService = rssFetcherService,
    private readonly parser: FeedParserService = feedParserService,
    private readonly deduplicator: DeduplicationService = deduplicationService,
    private readonly monitoring: RssMonitoringService = rssMonitoringService,
  ) {}

  async enqueueActiveFeeds(): Promise<number> {
    let cursor: string | undefined;
    let count = 0;

    do {
      const sources = await this.sourceManager.listActiveSources(1_000, cursor);

      await Promise.all(
        sources.map((source) =>
          rssProcessingQueue.add(
            QUEUE_JOB_NAMES.processSource,
            { sourceId: source.id },
            { jobId: `rss-source:${source.id}:${Math.floor(Date.now() / 300_000)}` },
          ),
        ),
      );

      count += sources.length;
      cursor = sources.at(-1)?.id;
      if (sources.length < 1_000) break;
    } while (cursor);

    return count;
  }

  async enqueueFailedFeeds(staleBefore: Date): Promise<number> {
    const sources = await this.sourceManager.listFailedSources(staleBefore, 10_000);

    await Promise.all(
      sources.map((source) =>
        rssProcessingQueue.add(
          QUEUE_JOB_NAMES.processSource,
          { sourceId: source.id, force: true },
          { jobId: `rss-failed-source:${source.id}:${Math.floor(Date.now() / 3_600_000)}` },
        ),
      ),
    );

    return sources.length;
  }

  async processSource(source: RssSourceRecord): Promise<void> {
    const startedAt = new Date();
    const jobExecutionId = await this.monitoring.startJobExecution({
      jobKey: `rss-source-${source.id}`,
      jobName: `Fetch RSS source: ${source.name}`,
      sourceId: source.id,
      payload: { sourceUrl: source.url },
    });

    let fetchedItems = 0;
    let queuedItems = 0;
    let duplicateUrlItems = 0;

    try {
      const fetchResult = await this.fetcher.fetchFeed({ source });
      const parsedItems = this.parser.parseFeed(fetchResult).map((item) => this.parser.normalizeItem(item));
      fetchedItems = parsedItems.length;

      const normalizedArticles: NormalizedArticleInput[] = [];

      for (const item of parsedItems) {
        const dedupedUrl = this.fetcher.dedupeUrl(item.url);

        if (!dedupedUrl) {
          duplicateUrlItems += 1;
          continue;
        }

        normalizedArticles.push(this.deduplicator.normalizeForDeduplication({ ...item, url: dedupedUrl }));
      }

      await Promise.all(
        normalizedArticles.map((article) =>
          rssProcessingQueue.add(
            QUEUE_JOB_NAMES.processArticle,
            { article, sourceId: source.id } satisfies ProcessArticleJob,
            { jobId: `rss-article:${article.urlHash}` },
          ),
        ),
      );

      queuedItems = normalizedArticles.length;
      await this.sourceManager.markFetchSuccess(source.id, fetchResult.fetchedAt);
      await this.monitoring.finishJobExecution({
        executionId: jobExecutionId,
        status: "SUCCEEDED",
        recordsRead: fetchedItems,
        recordsWritten: queuedItems,
        metadata: { duplicateUrlItems, fetchDurationMs: fetchResult.durationMs },
      });
      await this.monitoring.recordFeedMetrics({
        sourceId: source.id,
        jobExecutionId,
        startedAt,
        finishedAt: new Date(),
        durationMs: Date.now() - startedAt.getTime(),
        fetchedItems,
        savedItems: 0,
        duplicateItems: duplicateUrlItems,
        failedItems: 0,
        success: true,
      });
    } catch (error) {
      await this.sourceManager.markFetchFailure(source.id, error);
      await this.monitoring.finishJobExecution({
        executionId: jobExecutionId,
        status: "FAILED",
        recordsRead: fetchedItems,
        recordsWritten: queuedItems,
        error,
      });
      await this.monitoring.recordFeedMetrics({
        sourceId: source.id,
        jobExecutionId,
        startedAt,
        finishedAt: new Date(),
        durationMs: Date.now() - startedAt.getTime(),
        fetchedItems,
        savedItems: 0,
        duplicateItems: duplicateUrlItems,
        failedItems: fetchedItems - queuedItems,
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      });

      throw error;
    } finally {
      this.fetcher.resetUrlCache();
    }
  }

  async processArticle(job: ProcessArticleJob): Promise<{ newsId?: string; duplicate: boolean }> {
    const duplicate = await this.deduplicator.detectDuplicate(job.article);

    if (duplicate.isDuplicate) {
      logger.info("RSS article skipped as duplicate", {
        sourceId: job.sourceId,
        duplicateNewsId: duplicate.duplicateNewsId,
        reason: duplicate.reason,
        score: duplicate.score,
        url: job.article.url,
      });

      return { newsId: duplicate.duplicateNewsId, duplicate: true };
    }

    const news = await this.prisma.news.create({
      data: {
        sourceId: job.sourceId,
        categoryId: job.article.categoryId,
        primaryCountryId: job.article.countryId,
        title: job.article.title,
        slug: job.article.slug,
        originalUrl: job.article.url,
        canonicalUrl: job.article.url,
        urlHash: job.article.urlHash,
        contentHash: job.article.contentHash,
        excerpt: job.article.description,
        body: job.article.content,
        author: job.article.author,
        imageUrl: job.article.image,
        language: job.article.language,
        industryType: job.article.industryType,
        publishedAt: job.article.publishedAt,
        status: "INGESTED",
      },
      select: { id: true },
    });

    await aiProcessingQueue.add(
      QUEUE_JOB_NAMES.processAi,
      {
        newsId: news.id,
        taskTypes: ["summarize", "classify", "extract_entities", "translate"],
      } satisfies AiProcessingJob,
      { jobId: `ai-processing:${news.id}` },
    );

    return { newsId: news.id, duplicate: false };
  }

  async cleanupOldLogs(olderThan: Date): Promise<number> {
    const result = await this.prisma.jobExecution.deleteMany({
      where: {
        createdAt: { lt: olderThan },
        status: { in: ["SUCCEEDED", "FAILED", "CANCELLED", "SKIPPED"] },
      },
    });

    return result.count;
  }
}

export const articlePipelineService = new ArticlePipelineService();
