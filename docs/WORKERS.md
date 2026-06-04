# Worker Runtime Guide

Global Food & Beverage Intelligence uses BullMQ and Redis to run ingestion and AI enrichment outside request/response traffic.

## Queues

- `rss-ingestion`: scheduler-level jobs such as `fetch-active-feeds`, `refresh-failed-feeds`, and `cleanup-old-logs`.
- `rss-processing`: per-source and per-article RSS parsing, normalization, deduplication, and article persistence.
- `ai-processing`: article summarization, translation, classification, tagging, and structured intelligence extraction.

## RSS worker

Start with:

```bash
npm run worker:rss
```

The RSS worker consumes `rss-ingestion` and `rss-processing`. It enqueues active sources, refreshes failed feeds, processes feed items, persists new `News` rows, and enqueues AI jobs.

## AI worker

Start with:

```bash
npm run worker:ai
```

The AI worker consumes `ai-processing`. It is idempotent at the article level and should skip or safely retry articles that were already processed.

Scale AI workers carefully because OpenAI cost and rate limits are proportional to concurrency. Configure `AI_WORKER_CONCURRENCY` for your runtime.

## Scheduler

Start with:

```bash
npm run scheduler:start
```

The scheduler registers repeatable jobs:

- Fetch active feeds every 5 minutes by default.
- Refresh failed feeds every hour.
- Clean old logs daily.

`RSS_FETCH_INTERVAL_MINUTES` documents the expected cadence for deployments and should match runtime scheduler configuration.

## Internal cron endpoint

`/api/internal/cron/rss` can enqueue an immediate `fetch-active-feeds` job from managed cron services. Protect calls with either:

```http
Authorization: Bearer <CRON_SECRET>
```

or:

```http
x-cron-secret: <CRON_SECRET>
```

## Scaling workers

- Run multiple `worker-rss` replicas for high feed volume.
- Run multiple `worker-ai` replicas for high article volume, bounded by OpenAI rate limits and budget.
- Keep exactly one scheduler registration process per environment unless you understand BullMQ repeatable job deduplication semantics.
- Use separate process types for web, RSS workers, AI workers, and scheduler.

## Monitoring jobs

Monitor:

- Queue depth and failed job count in Redis/BullMQ.
- `SystemJob` and `JobExecution` records in PostgreSQL.
- Feed `successCount`, `errorCount`, `failureReason`, and `lastFetchedAt`.
- AI token usage and `AIProcessingLog` failures.
- `/api/health` for database and Redis availability.

## Restart behavior

Workers are safe to restart. BullMQ will re-deliver unlocked failed or stalled jobs according to retry settings. Use process managers or container restart policies (`restart: unless-stopped`) so workers resume after deploys, crashes, or host restarts.
