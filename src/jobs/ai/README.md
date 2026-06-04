# AI Content Processing Engine

Processes articles from the `ai-processing` BullMQ queue and writes structured intelligence back to PostgreSQL through Prisma.

## Flow

```txt
News article
→ clean content
→ detect language
→ OpenAI structured JSON analysis
→ generate English/Chinese translations and summaries
→ extract categories, tags, brands, countries, launches, franchises, funding
→ idempotently persist structured records
→ update AIProcessingLog and mark AI review status as pending_review
```

## Services

- `ai-client.service.ts`: OpenAI API calls, retry, timeout, JSON parsing, token usage extraction.
- `content-cleaner.service.ts`: HTML/script cleanup, whitespace normalization, content length limit.
- `language-detector.service.ts`: deterministic language pre-detection fallback.
- `translation.service.ts`: maps OpenAI title/summary/key takeaway output into translation writes.
- `summary.service.ts`: validates generated summaries and takeaway arrays.
- `classification.service.ts`: resolves industry/category output to Prisma records.
- `entity-extraction.service.ts`: resolves strict brand and country mentions to existing database entities.
- `tagging.service.ts`: upserts tags and NewsTag joins.
- `product-launch-detector.service.ts`: writes detected ProductLaunch records.
- `franchise-detector.service.ts`: writes detected FranchiseOpportunity records.
- `funding-detector.service.ts`: writes detected FundingEvent records.
- `ai-processing-orchestrator.service.ts`: idempotent end-to-end article processing transaction orchestration.

## Environment

```txt
OPENAI_API_KEY=...
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_CONTENT_MODEL=gpt-4.1-mini
OPENAI_CONTENT_FALLBACK_MODEL=gpt-4.1-nano
OPENAI_REQUEST_TIMEOUT_MS=45000
OPENAI_MAX_RETRIES=3
AI_CONTENT_MAX_CHARS=24000
AI_WORKER_CONCURRENCY=5
AI_MIN_CONFIDENCE_FOR_WRITE=0.55
REDIS_URL=redis://localhost:6379
```

## Scalability

- Worker is stateless and horizontally scalable.
- Processing is idempotent and skips already processed articles unless `force` is set.
- Extraction writes only existing brand/country matches to reduce hallucinations.
- AIProcessingLog captures token usage, cost metadata, errors, and raw model metadata for auditability.
