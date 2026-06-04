import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "../../../services/database/prisma";
import { aiConfig } from "../config/ai.config";
import type { MentionCandidate } from "../types";
import { clampConfidence } from "../utils/json";

export class EntityExtractionService {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async saveBrandMentions(newsId: string, mentions: MentionCandidate[], tx: Prisma.TransactionClient = this.prisma): Promise<void> {
    for (const mention of this.filterMentions(mentions)) {
      const brand = await tx.brand.findFirst({
        where: {
          OR: [
            { name: { equals: mention.name, mode: "insensitive" } },
            { aliases: { has: mention.name } },
          ],
        },
        select: { id: true },
      });

      if (!brand) continue;

      await tx.brandMention.upsert({
        where: { newsId_brandId: { newsId, brandId: brand.id } },
        update: {
          confidence: clampConfidence(mention.confidence),
          mentionText: mention.name,
          context: mention.evidence,
          source: "ai",
        },
        create: {
          newsId,
          brandId: brand.id,
          confidence: clampConfidence(mention.confidence),
          mentionText: mention.name,
          context: mention.evidence,
          source: "ai",
        },
      });
    }
  }

  async saveCountryMentions(newsId: string, mentions: MentionCandidate[], tx: Prisma.TransactionClient = this.prisma): Promise<void> {
    for (const mention of this.filterMentions(mentions)) {
      const country = await tx.country.findFirst({
        where: {
          OR: [
            { name: { equals: mention.name, mode: "insensitive" } },
            { iso2: { equals: mention.name.toUpperCase() } },
            { iso3: { equals: mention.name.toUpperCase() } },
          ],
        },
        select: { id: true },
      });

      if (!country) continue;

      await tx.countryMention.upsert({
        where: { newsId_countryId: { newsId, countryId: country.id } },
        update: {
          confidence: clampConfidence(mention.confidence),
          mentionText: mention.name,
          context: mention.evidence,
          source: "ai",
        },
        create: {
          newsId,
          countryId: country.id,
          confidence: clampConfidence(mention.confidence),
          mentionText: mention.name,
          context: mention.evidence,
          source: "ai",
        },
      });
    }
  }

  async findBrandId(name?: string, tx: Prisma.TransactionClient = this.prisma): Promise<string | null> {
    if (!name) return null;
    const brand = await tx.brand.findFirst({
      where: { OR: [{ name: { equals: name, mode: "insensitive" } }, { aliases: { has: name } }] },
      select: { id: true },
    });
    return brand?.id ?? null;
  }

  async findCountryId(name?: string, tx: Prisma.TransactionClient = this.prisma): Promise<string | null> {
    if (!name) return null;
    const country = await tx.country.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: "insensitive" } },
          { iso2: { equals: name.toUpperCase() } },
          { iso3: { equals: name.toUpperCase() } },
        ],
      },
      select: { id: true },
    });
    return country?.id ?? null;
  }

  private filterMentions(mentions: MentionCandidate[]): MentionCandidate[] {
    return (Array.isArray(mentions) ? mentions : [])
      .filter((mention) => mention.name && clampConfidence(mention.confidence) >= aiConfig.minConfidenceForWrite)
      .slice(0, 25);
  }
}

export const entityExtractionService = new EntityExtractionService();
