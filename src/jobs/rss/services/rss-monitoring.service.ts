import type { JobStatus, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "../../../services/database/prisma";
import { logger } from "../../../lib/logger/structured-logger";
import type { RssMetrics } from "../types";

export class RssMonitoringService {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async startJobExecution(input: {
    jobKey: string;
    jobName: string;
    sourceId?: string;
    payload?: Record<string, unknown>;
  }): Promise<string> {
    const job = await this.prisma.systemJob.upsert({
      where: { key: input.jobKey },
      update: { status: "RUNNING", payload: input.payload ?? {} },
      create: {
        key: input.jobKey,
        name: input.jobName,
        status: "RUNNING",
        payload: input.payload ?? {},
      },
    });

    const execution = await this.prisma.jobExecution.create({
      data: {
        jobId: job.id,
        sourceId: input.sourceId,
        status: "RUNNING",
        startedAt: new Date(),
        metadata: input.payload ?? {},
      },
    });

    return execution.id;
  }

  async finishJobExecution(input: {
    executionId: string;
    status: JobStatus;
    recordsRead?: number;
    recordsWritten?: number;
    error?: unknown;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const finishedAt = new Date();
    const existing = await this.prisma.jobExecution.findUnique({
      where: { id: input.executionId },
      select: { startedAt: true, jobId: true },
    });

    const durationMs = existing?.startedAt ? finishedAt.getTime() - existing.startedAt.getTime() : undefined;

    await this.prisma.jobExecution.update({
      where: { id: input.executionId },
      data: {
        status: input.status,
        finishedAt,
        durationMs,
        recordsRead: input.recordsRead ?? 0,
        recordsWritten: input.recordsWritten ?? 0,
        errorMessage: input.error instanceof Error ? input.error.message : input.error ? String(input.error) : null,
        errorStack: input.error instanceof Error ? input.error.stack : null,
        metadata: input.metadata ?? {},
      },
    });

    if (existing?.jobId) {
      await this.prisma.systemJob.update({
        where: { id: existing.jobId },
        data: { status: input.status },
      });
    }
  }

  async recordFeedMetrics(metrics: RssMetrics): Promise<void> {
    logger.info("RSS feed metrics", { ...metrics });

    if (!metrics.jobExecutionId) return;

    await this.prisma.jobExecution.update({
      where: { id: metrics.jobExecutionId },
      data: {
        recordsRead: metrics.fetchedItems,
        recordsWritten: metrics.savedItems,
        durationMs: metrics.durationMs,
        status: metrics.success ? "SUCCEEDED" : "FAILED",
        errorMessage: metrics.errorMessage,
        metadata: {
          duplicateItems: metrics.duplicateItems,
          failedItems: metrics.failedItems,
          successRate:
            metrics.fetchedItems === 0
              ? 0
              : Number(((metrics.savedItems + metrics.duplicateItems) / metrics.fetchedItems).toFixed(4)),
          processingTimeMs: metrics.durationMs,
        },
      },
    });
  }

  async getDashboardMetrics() {
    const [activeFeeds, failedFeeds, recentExecutions] = await Promise.all([
      this.prisma.source.count({ where: { active: true, isActive: true } }),
      this.prisma.source.count({ where: { active: true, isActive: true, failureCount: { gt: 0 } } }),
      this.prisma.jobExecution.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24) } },
        select: { status: true, durationMs: true, recordsRead: true, recordsWritten: true },
        take: 10_000,
      }),
    ]);

    const totalExecutions = recentExecutions.length;
    const successfulExecutions = recentExecutions.filter((execution) => execution.status === "SUCCEEDED").length;

    return {
      activeFeeds,
      failedFeeds,
      totalExecutions24h: totalExecutions,
      successRate24h: totalExecutions === 0 ? 0 : successfulExecutions / totalExecutions,
      averageProcessingTimeMs:
        totalExecutions === 0
          ? 0
          : recentExecutions.reduce((sum, execution) => sum + (execution.durationMs ?? 0), 0) / totalExecutions,
      articlesRead24h: recentExecutions.reduce((sum, execution) => sum + execution.recordsRead, 0),
      articlesWritten24h: recentExecutions.reduce((sum, execution) => sum + execution.recordsWritten, 0),
    };
  }
}

export const rssMonitoringService = new RssMonitoringService();
