# RSS Aggregation Engine

Production RSS ingestion architecture for Global Food & Beverage Intelligence.

```txt
src/jobs/rss/
├── config/                         # Runtime configuration for Redis, retries, timeouts, concurrency, cleanup windows, and user-agent rotation.
├── cron/                           # BullMQ repeatable job registration for scheduled feed fetching, failed-feed refreshes, and log cleanup.
├── queues/                         # BullMQ queue setup for rss-ingestion, rss-processing, and ai-processing with retry/backoff policies.
├── services/                       # Source management, feed fetching, parsing, deduplication, pipeline orchestration, and monitoring services.
├── utils/                          # Hashing, URL normalization, slugging, XML extraction, and content normalization helpers.
├── workers/                        # Horizontally scalable BullMQ workers for source ingestion, article processing, and AI queue handoff.
├── index.ts                        # Public exports for the RSS engine.
└── types.ts                        # Shared contracts for sources, fetched feeds, parsed articles, dedupe results, queue jobs, and metrics.
```

## Pipeline

```txt
RSS Feed / Atom Feed / RSSHub Feed
→ RssSourceManager loads active database sources
→ RssFetcherService fetches XML with retries, timeouts, and user-agent rotation
→ FeedParserService extracts and normalizes article fields
→ DeduplicationService checks URL hash, content hash, and similar titles
→ ArticlePipelineService saves News records
→ BullMQ enqueues AI processing tasks
→ RssMonitoringService writes SystemJob and JobExecution metrics
```

## Queues

- `rss-ingestion`: scheduled orchestration jobs such as active feed scans, failed feed refreshes, and log cleanup.
- `rss-processing`: source-level fetch jobs and article-level persistence jobs.
- `ai-processing`: AI summarization, classification, entity extraction, and translation handoff jobs.

## Scaling notes

- Source scans page through active feeds to support 10,000+ RSS sources.
- Processing jobs use deterministic BullMQ job IDs to reduce duplicate queue entries.
- Article deduplication uses normalized URL hashes, content hashes, and title similarity.
- Workers are stateless and can run horizontally across containers.
- Feed status, errors, success rate, and processing time are persisted to `SystemJob` and `JobExecution` for dashboard use.
