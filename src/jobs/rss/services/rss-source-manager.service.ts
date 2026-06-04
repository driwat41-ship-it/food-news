import type { IndustryType, Language, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "../../../services/database/prisma";
import type { RssSourceRecord } from "../types";

interface UpsertRssSourceInput {
  name: string;
  url: string;
  countryId?: string | null;
  language: Language;
  categoryId?: string | null;
  industryType?: IndustryType | null;
  active?: boolean;
}

export class RssSourceManager {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async upsertSource(input: UpsertRssSourceInput): Promise<RssSourceRecord> {
    const source = await this.prisma.source.upsert({
      where: { url: input.url },
      update: {
        name: input.name,
        feedUrl: input.url,
        countryId: input.countryId,
        language: input.language,
        categoryId: input.categoryId,
        industryType: input.industryType,
        active: input.active ?? true,
        isActive: input.active ?? true,
      },
      create: {
        name: input.name,
        slug: this.toSlug(input.name),
        url: input.url,
        feedUrl: input.url,
        countryId: input.countryId,
        language: input.language,
        categoryId: input.categoryId,
        industryType: input.industryType,
        active: input.active ?? true,
        isActive: input.active ?? true,
      },
    });

    return this.toRecord(source);
  }

  async listActiveSources(limit = 1_000, cursor?: string): Promise<RssSourceRecord[]> {
    const sources = await this.prisma.source.findMany({
      where: {
        active: true,
        isActive: true,
        OR: [{ url: { not: null } }, { feedUrl: { not: null } }],
      },
      orderBy: [{ lastFetchedAt: "asc" }, { lastCrawledAt: "asc" }, { id: "asc" }],
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    return sources.map((source) => this.toRecord(source));
  }


  async getSourceById(sourceId: string): Promise<RssSourceRecord | null> {
    const source = await this.prisma.source.findUnique({ where: { id: sourceId } });
    return source ? this.toRecord(source) : null;
  }

  async listFailedSources(staleBefore: Date, limit = 1_000): Promise<RssSourceRecord[]> {
    const sources = await this.prisma.source.findMany({
      where: {
        active: true,
        isActive: true,
        failureCount: { gt: 0 },
        OR: [{ lastFetchedAt: null }, { lastFetchedAt: { lt: staleBefore } }],
      },
      orderBy: [{ failureCount: "desc" }, { lastFetchedAt: "asc" }],
      take: limit,
    });

    return sources.map((source) => this.toRecord(source));
  }

  async markFetchSuccess(sourceId: string, fetchedAt = new Date()): Promise<void> {
    await this.prisma.source.update({
      where: { id: sourceId },
      data: {
        lastFetchedAt: fetchedAt,
        lastCrawledAt: fetchedAt,
        lastSuccessAt: fetchedAt,
        failureCount: 0,
        failureReason: null,
        successCount: { increment: 1 },
      },
    });
  }

  async markFetchFailure(sourceId: string, error: unknown): Promise<void> {
    await this.prisma.source.update({
      where: { id: sourceId },
      data: {
        lastFetchedAt: new Date(),
        lastCrawledAt: new Date(),
        failureCount: { increment: 1 },
        errorCount: { increment: 1 },
        failureReason: error instanceof Error ? error.message : String(error),
      },
    });
  }

  private toRecord(source: {
    id: string;
    name: string;
    url?: string | null;
    feedUrl?: string | null;
    countryId?: string | null;
    language: Language;
    categoryId?: string | null;
    industryType?: IndustryType | null;
    active?: boolean | null;
    isActive?: boolean | null;
    lastFetchedAt?: Date | null;
    lastCrawledAt?: Date | null;
  }): RssSourceRecord {
    const url = source.url ?? source.feedUrl;

    if (!url) {
      throw new Error(`RSS source ${source.id} does not have a URL`);
    }

    return {
      id: source.id,
      name: source.name,
      url,
      countryId: source.countryId,
      language: source.language,
      categoryId: source.categoryId,
      industryType: source.industryType,
      active: source.active ?? source.isActive ?? true,
      lastFetchedAt: source.lastFetchedAt ?? source.lastCrawledAt,
    };
  }

  private toSlug(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }
}

export const rssSourceManager = new RssSourceManager();
