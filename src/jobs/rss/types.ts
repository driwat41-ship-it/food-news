import type { IndustryType, Language } from "@prisma/client";

export type RssSourceKind = "rss" | "atom" | "rsshub";

export interface RssSourceRecord {
  id: string;
  name: string;
  url: string;
  countryId?: string | null;
  language: Language;
  categoryId?: string | null;
  industryType?: IndustryType | null;
  active: boolean;
  lastFetchedAt?: Date | null;
}

export interface FetchFeedInput {
  source: RssSourceRecord;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface FetchFeedResult {
  source: RssSourceRecord;
  xml: string;
  statusCode: number;
  durationMs: number;
  fetchedAt: Date;
}

export interface ParsedFeedItem {
  title: string;
  description?: string;
  content?: string;
  author?: string;
  publishedAt?: Date;
  sourceId: string;
  sourceName: string;
  url: string;
  image?: string;
  language: Language;
  categoryId?: string | null;
  countryId?: string | null;
  industryType?: IndustryType | null;
}

export interface NormalizedArticleInput extends ParsedFeedItem {
  slug: string;
  urlHash: string;
  contentHash: string;
  titleFingerprint: string;
}

export interface DeduplicationResult {
  isDuplicate: boolean;
  duplicateNewsId?: string;
  reason?: "url_hash" | "content_hash" | "similar_title";
  score?: number;
}

export interface RssMetrics {
  sourceId: string;
  jobExecutionId?: string;
  startedAt: Date;
  finishedAt: Date;
  durationMs: number;
  fetchedItems: number;
  savedItems: number;
  duplicateItems: number;
  failedItems: number;
  success: boolean;
  errorMessage?: string;
}

export interface QueueArticleJob {
  sourceId: string;
  force?: boolean;
}

export interface ProcessArticleJob {
  article: NormalizedArticleInput;
  sourceId: string;
}

export interface AiProcessingJob {
  newsId: string;
  taskTypes: Array<"summarize" | "classify" | "extract_entities" | "translate">;
}
