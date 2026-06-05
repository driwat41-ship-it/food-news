import type { PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "../../../services/database/prisma";
import { logger } from "../../../lib/logger/structured-logger";
import { aiProcessingQueue, QUEUE_JOB_NAMES, rssProcessingQueue } from "../queues/rss.queues";
import { safeJobId } from "../queues/job-ids";
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
            { jobId: safeJobId(["rss-source", source.id, Math.floor(Date.now() / 300_000)]) },
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
          { jobId: safeJobId(["rss-failed-source", source.id, Math.floor(Date.now() / 3_600_000)]) },
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
            { jobId: safeJobId(["rss-article", article.urlHash]) },
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
    const article = this.normalizeQueuedArticle(job.article);
    const duplicate = await this.deduplicator.detectDuplicate(article);

    if (duplicate.isDuplicate) {
      logger.info("RSS article skipped as duplicate", {
        sourceId: job.sourceId,
        duplicateNewsId: duplicate.duplicateNewsId,
        reason: duplicate.reason,
        score: duplicate.score,
        url: article.url,
      });

      return { newsId: duplicate.duplicateNewsId, duplicate: true };
    }

    const news = await this.prisma.news.create({
      data: {
        sourceId: job.sourceId,
        categoryId: article.categoryId,
        primaryCountryId: article.countryId,
        title: article.title,
        slug: article.slug,
        originalUrl: article.url,
        canonicalUrl: article.url,
        urlHash: article.urlHash,
        contentHash: article.contentHash,
        excerpt: article.description,
        body: article.content,
        author: article.author,
        imageUrl: article.image,
        language: article.language,
        industryType: article.industryType,
        publishedAt: article.publishedAt,
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
      { jobId: safeJobId(["ai-processing", news.id]) },
    );

    return { newsId: news.id, duplicate: false };
  }

  private normalizeQueuedArticle(article: NormalizedArticleInput): NormalizedArticleInput {
    return {
      ...article,
      publishedAt: article.publishedAt ? new Date(article.publishedAt) : undefined,
    };
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
