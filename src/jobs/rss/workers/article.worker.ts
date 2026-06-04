import { Worker } from "bullmq";
import type { PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "../../../services/database/prisma";
import { logger } from "../../../lib/logger/structured-logger";
import { rssConfig } from "../config/rss.config";
import { AI_PROCESSING_QUEUE, QUEUE_JOB_NAMES, redisConnection } from "../queues/rss.queues";
import type { AiProcessingJob } from "../types";

class AiProcessingWorkerService {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async process(job: AiProcessingJob) {
    const log = await this.prisma.aIProcessingLog.create({
      data: {
        newsId: job.newsId,
        taskType: job.taskTypes.join(","),
        provider: "openai",
        model: process.env.OPENAI_INGESTION_MODEL ?? "gpt-4.1-mini",
        status: "RUNNING",
        startedAt: new Date(),
        metadata: { taskTypes: job.taskTypes },
      },
    });

    try {
      // The actual OpenAI calls live behind the AI service boundary. This worker records
      // durable AI workload state and keeps the RSS pipeline horizontally scalable.
      await this.prisma.news.update({
        where: { id: job.newsId },
        data: { status: "PROCESSING" },
      });

      await this.prisma.aIProcessingLog.update({
        where: { id: log.id },
        data: {
          status: "QUEUED",
          finishedAt: new Date(),
          metadata: { taskTypes: job.taskTypes, queuedForAiService: true },
        },
      });

      return { newsId: job.newsId, queuedForAiService: true };
    } catch (error) {
      await this.prisma.aIProcessingLog.update({
        where: { id: log.id },
        data: {
          status: "FAILED",
          finishedAt: new Date(),
          metadata: {
            taskTypes: job.taskTypes,
            error: error instanceof Error ? error.message : String(error),
          },
        },
      });

      throw error;
    }
  }
}

const aiProcessingWorkerService = new AiProcessingWorkerService();

export const articleWorker = new Worker<AiProcessingJob>(
  AI_PROCESSING_QUEUE,
  async (job) => {
    if (job.name !== QUEUE_JOB_NAMES.processAi) {
      throw new Error(`Unsupported article worker job: ${job.name}`);
    }

    return aiProcessingWorkerService.process(job.data);
  },
  {
    connection: redisConnection,
    concurrency: rssConfig.aiConcurrency,
    lockDuration: 180_000,
  },
);

articleWorker.on("completed", (job) => {
  logger.info("Article AI worker job completed", { jobId: job.id, jobName: job.name });
});

articleWorker.on("failed", (job, error) => {
  logger.error("Article AI worker job failed", {
    jobId: job?.id,
    jobName: job?.name,
    error: error.message,
    stack: error.stack,
  });
});
