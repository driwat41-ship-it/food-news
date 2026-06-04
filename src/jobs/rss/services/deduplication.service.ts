import type { PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "../../../services/database/prisma";
import type { DeduplicationResult, NormalizedArticleInput, ParsedFeedItem } from "../types";
import { fingerprintTitle, normalizeUrl, sha256, slugify } from "../utils/hash";

export class DeduplicationService {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  normalizeForDeduplication(item: ParsedFeedItem): NormalizedArticleInput {
    const normalizedUrl = normalizeUrl(item.url);
    const bodyForHash = [item.title, item.description, item.content].filter(Boolean).join("\n");
    const titleFingerprint = fingerprintTitle(item.title);

    return {
      ...item,
      url: normalizedUrl,
      slug: `${slugify(item.title)}-${sha256(normalizedUrl).slice(0, 8)}`,
      urlHash: sha256(normalizedUrl),
      contentHash: sha256(bodyForHash),
      titleFingerprint,
    };
  }

  async detectDuplicate(article: NormalizedArticleInput): Promise<DeduplicationResult> {
    const urlMatch = await this.findByUrlHash(article.urlHash);

    if (urlMatch) {
      return { isDuplicate: true, duplicateNewsId: urlMatch.id, reason: "url_hash", score: 1 };
    }

    const contentMatch = await this.findByContentHash(article.contentHash);

    if (contentMatch) {
      return { isDuplicate: true, duplicateNewsId: contentMatch.id, reason: "content_hash", score: 1 };
    }

    const titleMatch = await this.findSimilarTitle(article);

    if (titleMatch) {
      return {
        isDuplicate: true,
        duplicateNewsId: titleMatch.id,
        reason: "similar_title",
        score: titleMatch.score,
      };
    }

    return { isDuplicate: false };
  }

  private async findByUrlHash(urlHash: string): Promise<{ id: string } | null> {
    return this.prisma.news.findUnique({ where: { urlHash }, select: { id: true } });
  }

  private async findByContentHash(contentHash: string): Promise<{ id: string } | null> {
    return this.prisma.news.findFirst({
      where: { contentHash },
      select: { id: true },
    });
  }

  private async findSimilarTitle(article: NormalizedArticleInput): Promise<{ id: string; score: number } | null> {
    const candidates = await this.prisma.news.findMany({
      where: {
        sourceId: article.sourceId,
        publishedAt: article.publishedAt
          ? {
              gte: new Date(article.publishedAt.getTime() - 1000 * 60 * 60 * 24 * 7),
              lte: new Date(article.publishedAt.getTime() + 1000 * 60 * 60 * 24 * 7),
            }
          : undefined,
      },
      select: { id: true, title: true },
      orderBy: { publishedAt: "desc" },
      take: 100,
    });

    let best: { id: string; score: number } | null = null;

    for (const candidate of candidates) {
      const score = this.titleSimilarity(article.titleFingerprint, fingerprintTitle(candidate.title));
      if (score >= 0.92 && (!best || score > best.score)) {
        best = { id: candidate.id, score };
      }
    }

    return best;
  }

  private titleSimilarity(left: string, right: string): number {
    if (!left || !right) return 0;
    if (left === right) return 1;

    const leftTokens = new Set(left.split(" ").filter(Boolean));
    const rightTokens = new Set(right.split(" ").filter(Boolean));
    const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
    const union = new Set([...leftTokens, ...rightTokens]).size;

    return union === 0 ? 0 : intersection / union;
  }
}

export const deduplicationService = new DeduplicationService();
