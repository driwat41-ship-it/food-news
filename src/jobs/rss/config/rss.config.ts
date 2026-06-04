export const rssConfig = {
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  defaultTimeoutMs: Number(process.env.RSS_FETCH_TIMEOUT_MS ?? 15_000),
  maxRetries: Number(process.env.RSS_FETCH_MAX_RETRIES ?? 3),
  retryBaseDelayMs: Number(process.env.RSS_FETCH_RETRY_BASE_DELAY_MS ?? 500),
  fetchIntervalMinutes: Number(process.env.RSS_FETCH_INTERVAL_MINUTES ?? 5),
  processingConcurrency: Number(process.env.RSS_PROCESSING_CONCURRENCY ?? 20),
  ingestionConcurrency: Number(process.env.RSS_INGESTION_CONCURRENCY ?? 10),
  aiConcurrency: Number(process.env.AI_PROCESSING_CONCURRENCY ?? 5),
  staleFailedFeedMinutes: Number(process.env.RSS_STALE_FAILED_FEED_MINUTES ?? 60),
  cleanupLogsOlderThanDays: Number(process.env.RSS_CLEANUP_LOGS_OLDER_THAN_DAYS ?? 30),
  userAgents: [
    "GlobalFoodBeverageIntelligenceBot/1.0 (+https://global-food-intelligence.example/bot)",
    "Mozilla/5.0 (compatible; GlobalFoodBeverageIntelligence/1.0; +https://global-food-intelligence.example)",
    "RSS Intelligence Aggregator/1.0 (+https://global-food-intelligence.example/rss)",
  ],
} as const;
