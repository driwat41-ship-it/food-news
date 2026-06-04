import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "../../../services/database/prisma";
import { aiConfig } from "../config/ai.config";
import type { FundingEventCandidate } from "../types";
import { clampConfidence } from "../utils/json";
import { slugifyWithHash } from "../utils/slug";
import { entityExtractionService, EntityExtractionService } from "./entity-extraction.service";

export class FundingDetectorService {
  constructor(
    private readonly prisma: PrismaClient = defaultPrisma,
    private readonly entities: EntityExtractionService = entityExtractionService,
  ) {}

  async save(newsId: string, events: FundingEventCandidate[], tx: Prisma.TransactionClient = this.prisma): Promise<void> {
    for (const event of (Array.isArray(events) ? events : []).slice(0, 10)) {
      if (!event.title || clampConfidence(event.confidence) < aiConfig.minConfidenceForWrite) continue;

      const brandId = await this.entities.findBrandId(event.brandName, tx);
      const countryId = await this.entities.findCountryId(event.countryName, tx);

      await tx.fundingEvent.upsert({
        where: { slug: slugifyWithHash(`${newsId}-${event.title}`) },
        update: {
          brandId,
          countryId,
          eventType: event.eventType || "other",
          amount: event.amount,
          currency: event.currency,
          announcedAt: this.parseDate(event.announcedAt),
          aiReviewStatus: "pending_review",
          summary: event.investors?.length ? `Investors: ${event.investors.join(", ")}` : undefined,
        },
        create: {
          newsId,
          title: event.title,
          slug: slugifyWithHash(`${newsId}-${event.title}`),
          brandId,
          countryId,
          eventType: event.eventType || "other",
          amount: event.amount,
          currency: event.currency,
          announcedAt: this.parseDate(event.announcedAt),
          aiReviewStatus: "pending_review",
          summary: event.investors?.length ? `Investors: ${event.investors.join(", ")}` : undefined,
        },
      });
    }
  }

  private parseDate(value?: string): Date | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
}

export const fundingDetectorService = new FundingDetectorService();
