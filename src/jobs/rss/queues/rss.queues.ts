import { Queue, QueueEvents, type ConnectionOptions } from "bullmq";
import { rssConfig } from "../config/rss.config";
import type { AiProcessingJob, ProcessArticleJob, QueueArticleJob } from "../types";

export const RSS_INGESTION_QUEUE = "rss-ingestion";
export const RSS_PROCESSING_QUEUE = "rss-processing";
export const AI_PROCESSING_QUEUE = "ai-processing";

export const QUEUE_JOB_NAMES = {
  fetchActiveFeeds: "fetch-active-feeds",
  refreshFailedFeeds: "refresh-failed-feeds",
  cleanupOldLogs: "cleanup-old-logs",
  processSource: "process-source",
  processArticle: "process-article",
  processAi: "process-ai",
} as const;

type RssIngestionJobName =
  | typeof QUEUE_JOB_NAMES.fetchActiveFeeds
  | typeof QUEUE_JOB_NAMES.refreshFailedFeeds
  | typeof QUEUE_JOB_NAMES.cleanupOldLogs;

type RssProcessingJobName =
  | typeof QUEUE_JOB_NAMES.processSource
  | typeof QUEUE_JOB_NAMES.processArticle;

type AiProcessingJobName = typeof QUEUE_JOB_NAMES.processAi;

type RssIngestionJobData = {
  triggeredBy?: string;
  requestedAt?: string;
};

export const redisConnection = {
  url: rssConfig.redisUrl,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
} satisfies ConnectionOptions;

export const rssIngestionQueue = new Queue<
  RssIngestionJobData,
  unknown,
  RssIngestionJobName,
  RssIngestionJobData,
  unknown,
  RssIngestionJobName
>(RSS_INGESTION_QUEUE, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5_000 },
    removeOnComplete: { age: 60 * 60 * 24, count: 10_000 },
    removeOnFail: { age: 60 * 60 * 24 * 7, count: 50_000 },
  },
});

export const rssProcessingQueue = new Queue<
  QueueArticleJob | ProcessArticleJob,
  unknown,
  RssProcessingJobName,
  QueueArticleJob | ProcessArticleJob,
  unknown,
  RssProcessingJobName
>(RSS_PROCESSING_QUEUE, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 2_000 },
    removeOnComplete: { age: 60 * 60 * 24, count: 100_000 },
    removeOnFail: { age: 60 * 60 * 24 * 7, count: 100_000 },
  },
});

export const aiProcessingQueue = new Queue<
  AiProcessingJob,
  unknown,
  AiProcessingJobName,
  AiProcessingJob,
  unknown,
  AiProcessingJobName
>(AI_PROCESSING_QUEUE, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 10_000 },
    removeOnComplete: { age: 60 * 60 * 24, count: 100_000 },
    removeOnFail: { age: 60 * 60 * 24 * 14, count: 100_000 },
  },
});

export const rssQueueEvents = {
  ingestion: new QueueEvents(RSS_INGESTION_QUEUE, { connection: redisConnection }),
  processing: new QueueEvents(RSS_PROCESSING_QUEUE, { connection: redisConnection }),
  ai: new QueueEvents(AI_PROCESSING_QUEUE, { connection: redisConnection }),
};
