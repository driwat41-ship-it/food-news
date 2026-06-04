import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "../../../services/database/prisma";
import { aiConfig } from "../config/ai.config";
import type { FranchiseOpportunityCandidate } from "../types";
import { clampConfidence } from "../utils/json";
import { slugifyWithHash } from "../utils/slug";
import { entityExtractionService, EntityExtractionService } from "./entity-extraction.service";

export class FranchiseDetectorService {
  constructor(
    private readonly prisma: PrismaClient = defaultPrisma,
    private readonly entities: EntityExtractionService = entityExtractionService,
  ) {}

  async save(newsId: string, opportunities: FranchiseOpportunityCandidate[], tx: Prisma.TransactionClient = this.prisma): Promise<void> {
    for (const opportunity of (Array.isArray(opportunities) ? opportunities : []).slice(0, 10)) {
      if (!opportunity.title || clampConfidence(opportunity.confidence) < aiConfig.minConfidenceForWrite) continue;

      const brandId = await this.entities.findBrandId(opportunity.brandName, tx);
      const countryId = await this.entities.findCountryId(opportunity.countryName, tx);

      await tx.franchiseOpportunity.upsert({
        where: { slug: slugifyWithHash(`${newsId}-${opportunity.title}`) },
        update: {
          description: opportunity.description,
          brandId,
          countryId,
          investmentMin: opportunity.investmentMin,
          investmentMax: opportunity.investmentMax,
          currency: opportunity.currency,
          aiReviewStatus: "pending_review",
        },
        create: {
          newsId,
          title: opportunity.title,
          slug: slugifyWithHash(`${newsId}-${opportunity.title}`),
          description: opportunity.description,
          brandId,
          countryId,
          investmentMin: opportunity.investmentMin,
          investmentMax: opportunity.investmentMax,
          currency: opportunity.currency,
          aiReviewStatus: "pending_review",
        },
      });
    }
  }
}

export const franchiseDetectorService = new FranchiseDetectorService();
