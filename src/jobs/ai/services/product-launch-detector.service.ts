import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "../../../services/database/prisma";
import { aiConfig } from "../config/ai.config";
import type { ProductLaunchCandidate } from "../types";
import { clampConfidence } from "../utils/json";
import { slugifyWithHash } from "../utils/slug";
import { entityExtractionService, EntityExtractionService } from "./entity-extraction.service";

export class ProductLaunchDetectorService {
  constructor(
    private readonly prisma: PrismaClient = defaultPrisma,
    private readonly entities: EntityExtractionService = entityExtractionService,
  ) {}

  async save(newsId: string, launches: ProductLaunchCandidate[], categoryId: string | null, tx: Prisma.TransactionClient = this.prisma): Promise<void> {
    for (const launch of (Array.isArray(launches) ? launches : []).slice(0, 10)) {
      if (!launch.title || clampConfidence(launch.confidence) < aiConfig.minConfidenceForWrite) continue;

      const brandId = await this.entities.findBrandId(launch.brandName, tx);
      const countryId = await this.entities.findCountryId(launch.countryName, tx);

      await tx.productLaunch.upsert({
        where: { slug: slugifyWithHash(`${newsId}-${launch.title}`) },
        update: {
          description: launch.description,
          brandId,
          countryId,
          categoryId,
          launchDate: this.parseDate(launch.launchDate),
          aiReviewStatus: "pending_review",
        },
        create: {
          newsId,
          title: launch.title,
          slug: slugifyWithHash(`${newsId}-${launch.title}`),
          description: launch.description,
          brandId,
          countryId,
          categoryId,
          launchDate: this.parseDate(launch.launchDate),
          aiReviewStatus: "pending_review",
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

export const productLaunchDetectorService = new ProductLaunchDetectorService();
