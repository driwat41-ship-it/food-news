export const aiConfig = {
  apiKey: process.env.OPENAI_API_KEY,
  baseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
  model: process.env.OPENAI_MODEL ?? process.env.OPENAI_CONTENT_MODEL ?? "gpt-4.1-mini",
  fallbackModel: process.env.OPENAI_FALLBACK_MODEL ?? process.env.OPENAI_CONTENT_FALLBACK_MODEL ?? "gpt-4.1-nano",
  requestTimeoutMs: Number(process.env.OPENAI_REQUEST_TIMEOUT_MS ?? 45_000),
  maxRetries: Number(process.env.OPENAI_MAX_RETRIES ?? 3),
  maxContentChars: Number(process.env.AI_CONTENT_MAX_CHARS ?? 24_000),
  workerConcurrency: Number(process.env.AI_WORKER_CONCURRENCY ?? 5),
  minConfidenceForWrite: Number(process.env.AI_MIN_CONFIDENCE_FOR_WRITE ?? 0.55),
} as const;
