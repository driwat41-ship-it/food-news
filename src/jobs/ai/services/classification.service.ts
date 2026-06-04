import type { IndustryType, Prisma, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "../../../services/database/prisma";
import type { AIArticleAnalysisResult } from "../types";
import { slugifyWithHash } from "../utils/slug";

const industryValues = new Set<IndustryType>([
  "TEA",
  "BUBBLE_TEA",
  "COFFEE",
  "RESTAURANT_CHAINS",
  "QSR",
  "FMCG",
  "BEVERAGE",
  "FOOD_SERVICE",
  "RETAIL",
  "OTHER",
]);

export class ClassificationService {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  normalizeIndustry(value: unknown): IndustryType {
    return industryValues.has(value as IndustryType) ? (value as IndustryType) : "OTHER";
  }

  async resolveCategory(result: AIArticleAnalysisResult, tx: Prisma.TransactionClient = this.prisma): Promise<string | null> {
    const industryType = this.normalizeIndustry(result.industryType);
    const categoryName = String(result.category || industryType).trim();

    const existing = await tx.category.findFirst({
      where: {
        OR: [{ name: { equals: categoryName, mode: "insensitive" } }, { industryType }],
      },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });

    if (existing) return existing.id;

    const created = await tx.category.create({
      data: {
        name: categoryName,
        slug: slugifyWithHash(categoryName),
        industryType,
      },
      select: { id: true },
    });

    return created.id;
  }
}

export const classificationService = new ClassificationService();
