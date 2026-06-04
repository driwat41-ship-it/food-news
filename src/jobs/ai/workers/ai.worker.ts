import { Worker } from "bullmq";
import { logger } from "../../../lib/logger/structured-logger";
import { rssConfig } from "../../rss/config/rss.config";
import { AI_PROCESSING_QUEUE, QUEUE_JOB_NAMES, redisConnection } from "../../rss/queues/rss.queues";
import { aiProcessingOrchestratorService } from "../services/ai-processing-orchestrator.service";
import type { AIProcessingJobPayload } from "../types";

export const aiWorker = new Worker<AIProcessingJobPayload>(
  AI_PROCESSING_QUEUE,
  async (job) => {
    if (job.name !== QUEUE_JOB_NAMES.processAi) {
      throw new Error(`Unsupported AI processing job: ${job.name}`);
    }

    logger.info("AI processing job started", { jobId: job.id, newsId: job.data.newsId, attempt: job.attemptsMade + 1 });
    return aiProcessingOrchestratorService.process(job.data);
  },
  {
    connection: redisConnection,
    concurrency: Number(process.env.AI_WORKER_CONCURRENCY ?? rssConfig.aiConcurrency),
    lockDuration: 300_000,
  },
);

aiWorker.on("completed", (job, result) => {
  logger.info("AI processing job completed", { jobId: job.id, newsId: job.data.newsId, result });
});

aiWorker.on("failed", (job, error) => {
  logger.error("AI processing job failed", {
    jobId: job?.id,
    newsId: job?.data.newsId,
    attemptsMade: job?.attemptsMade,
    error: error.message,
    stack: error.stack,
  });
});
