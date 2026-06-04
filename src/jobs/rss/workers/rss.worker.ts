import { Worker } from "bullmq";
import { logger } from "../../../lib/logger/structured-logger";
import { rssConfig } from "../config/rss.config";
import { QUEUE_JOB_NAMES, redisConnection, RSS_INGESTION_QUEUE, RSS_PROCESSING_QUEUE } from "../queues/rss.queues";
import { articlePipelineService } from "../services/article-pipeline.service";
import { rssSourceManager } from "../services/rss-source-manager.service";
import type { ProcessArticleJob, QueueArticleJob } from "../types";


export const rssIngestionWorker = new Worker(
  RSS_INGESTION_QUEUE,
  async (job) => {
    if (job.name === QUEUE_JOB_NAMES.fetchActiveFeeds) {
      const enqueued = await articlePipelineService.enqueueActiveFeeds();
      return { enqueued };
    }

    if (job.name === QUEUE_JOB_NAMES.refreshFailedFeeds) {
      const staleBefore = new Date(Date.now() - rssConfig.staleFailedFeedMinutes * 60_000);
      const enqueued = await articlePipelineService.enqueueFailedFeeds(staleBefore);
      return { enqueued, staleBefore };
    }

    if (job.name === QUEUE_JOB_NAMES.cleanupOldLogs) {
      const olderThan = new Date(Date.now() - rssConfig.cleanupLogsOlderThanDays * 24 * 60 * 60_000);
      const deleted = await articlePipelineService.cleanupOldLogs(olderThan);
      return { deleted, olderThan };
    }

    throw new Error(`Unsupported RSS ingestion job: ${job.name}`);
  },
  {
    connection: redisConnection,
    concurrency: rssConfig.ingestionConcurrency,
    lockDuration: 120_000,
  },
);

rssIngestionWorker.on("completed", (job) => {
  logger.info("RSS ingestion job completed", { jobId: job.id, jobName: job.name });
});

rssIngestionWorker.on("failed", (job, error) => {
  logger.error("RSS ingestion job failed", {
    jobId: job?.id,
    jobName: job?.name,
    error: error.message,
    stack: error.stack,
  });
});

export const rssWorker = new Worker<QueueArticleJob | ProcessArticleJob>(
  RSS_PROCESSING_QUEUE,
  async (job) => {
    if (job.name === QUEUE_JOB_NAMES.processSource) {
      const { sourceId } = job.data as QueueArticleJob;
      const source = await rssSourceManager.getSourceById(sourceId);

      if (!source) {
        throw new Error(`RSS source ${sourceId} was not found`);
      }

      await articlePipelineService.processSource(source);
      return { sourceId, processed: true };
    }

    if (job.name === QUEUE_JOB_NAMES.processArticle) {
      return articlePipelineService.processArticle(job.data as ProcessArticleJob);
    }

    throw new Error(`Unsupported RSS worker job: ${job.name}`);
  },
  {
    connection: redisConnection,
    concurrency: rssConfig.processingConcurrency,
    lockDuration: 120_000,
  },
);

rssWorker.on("completed", (job) => {
  logger.info("RSS worker job completed", { jobId: job.id, jobName: job.name });
});

rssWorker.on("failed", (job, error) => {
  logger.error("RSS worker job failed", {
    jobId: job?.id,
    jobName: job?.name,
    error: error.message,
    stack: error.stack,
  });
});
