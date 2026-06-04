import { logger } from "../../../lib/logger/structured-logger";
import { rssConfig } from "../config/rss.config";
import type { FetchFeedInput, FetchFeedResult } from "../types";
import { normalizeUrl } from "../utils/hash";

export class RssFetchError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly retryable = true,
  ) {
    super(message);
    this.name = "RssFetchError";
  }
}

export class RssFetcherService {
  private userAgentIndex = 0;
  private readonly seenUrls = new Set<string>();

  async fetchFeed(input: FetchFeedInput): Promise<FetchFeedResult> {
    const maxRetries = input.maxRetries ?? rssConfig.maxRetries;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
      try {
        return await this.fetchOnce(input, attempt);
      } catch (error) {
        lastError = error;
        const retryable = !(error instanceof RssFetchError) || error.retryable;

        logger.warn("RSS fetch attempt failed", {
          sourceId: input.source.id,
          sourceName: input.source.name,
          attempt,
          maxRetries,
          retryable,
          error: error instanceof Error ? error.message : String(error),
        });

        if (!retryable || attempt === maxRetries) break;
        await this.sleep(rssConfig.retryBaseDelayMs * 2 ** (attempt - 1));
      }
    }

    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  dedupeUrl(url: string): string | null {
    const normalizedUrl = normalizeUrl(url);

    if (this.seenUrls.has(normalizedUrl)) {
      return null;
    }

    this.seenUrls.add(normalizedUrl);
    return normalizedUrl;
  }

  resetUrlCache(): void {
    this.seenUrls.clear();
  }

  private async fetchOnce(input: FetchFeedInput, attempt: number): Promise<FetchFeedResult> {
    const startedAt = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), input.timeoutMs ?? rssConfig.defaultTimeoutMs);

    try {
      const response = await fetch(input.source.url, {
        headers: {
          Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
          "User-Agent": this.nextUserAgent(),
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new RssFetchError(
          `RSS fetch failed with status ${response.status}`,
          response.status,
          response.status >= 500 || response.status === 429,
        );
      }

      const xml = await response.text();

      if (!xml.trim()) {
        throw new RssFetchError("RSS feed response was empty", response.status, false);
      }

      return {
        source: input.source,
        xml,
        statusCode: response.status,
        durationMs: Date.now() - startedAt,
        fetchedAt: new Date(),
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new RssFetchError("RSS fetch timed out", undefined, true);
      }

      throw error;
    } finally {
      clearTimeout(timeout);
      logger.debug("RSS fetch finished", {
        sourceId: input.source.id,
        attempt,
        durationMs: Date.now() - startedAt,
      });
    }
  }

  private nextUserAgent(): string {
    const value = rssConfig.userAgents[this.userAgentIndex % rssConfig.userAgents.length];
    this.userAgentIndex += 1;
    return value;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const rssFetcherService = new RssFetcherService();
