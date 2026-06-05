import { logger } from "../../../lib/logger/structured-logger";
import { rssConfig } from "../config/rss.config";
import { safeJobId } from "../queues/job-ids";
import { QUEUE_JOB_NAMES, rssIngestionQueue } from "../queues/rss.queues";

export async function registerRssCronJobs(): Promise<void> {
  await Promise.all([
    rssIngestionQueue.add(
      QUEUE_JOB_NAMES.fetchActiveFeeds,
      {},
      {
        jobId: safeJobId(["cron", "rss", "fetch-active-feeds"]),
        repeat: { every: rssConfig.fetchIntervalMinutes * 60_000 },
      },
    ),
    rssIngestionQueue.add(
      QUEUE_JOB_NAMES.refreshFailedFeeds,
      {},
      {
        jobId: safeJobId(["cron", "rss", "refresh-failed-feeds"]),
        repeat: { every: 60 * 60_000 },
      },
    ),
    rssIngestionQueue.add(
      QUEUE_JOB_NAMES.cleanupOldLogs,
      {},
      {
        jobId: safeJobId(["cron", "rss", "cleanup-old-logs"]),
        repeat: { pattern: "0 3 * * *" },
      },
    ),
  ]);

  logger.info("RSS cron jobs registered", {
    fetchActiveFeeds: `every ${rssConfig.fetchIntervalMinutes} minutes`,
    refreshFailedFeeds: "every 1 hour",
    cleanupOldLogs: "daily at 03:00",
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  registerRssCronJobs().catch((error) => {
    logger.error("Failed to register RSS cron jobs", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  });
}
