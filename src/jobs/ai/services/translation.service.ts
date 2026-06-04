import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "../../../services/database/prisma";
import type { AIArticleAnalysisResult } from "../types";
import { slugifyWithHash } from "../utils/slug";

export class TranslationService {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async saveTranslations(newsId: string, result: AIArticleAnalysisResult, tx: Prisma.TransactionClient = this.prisma): Promise<void> {
    await Promise.all([
      tx.newsTranslation.upsert({
        where: { newsId_language: { newsId, language: "EN" } },
        update: {
          title: result.titleEn,
          slug: slugifyWithHash(`${result.titleEn}-${newsId}-en`),
          excerpt: result.summaryEn,
          aiSummary: result.summaryEn,
          keyTakeaways: result.keyTakeawaysEn,
          reviewStatus: "pending_review",
          translatedAt: new Date(),
        },
        create: {
          newsId,
          language: "EN",
          title: result.titleEn,
          slug: slugifyWithHash(`${result.titleEn}-${newsId}-en`),
          excerpt: result.summaryEn,
          aiSummary: result.summaryEn,
          keyTakeaways: result.keyTakeawaysEn,
          reviewStatus: "pending_review",
          translatedAt: new Date(),
        },
      }),
      tx.newsTranslation.upsert({
        where: { newsId_language: { newsId, language: "ZH" } },
        update: {
          title: result.titleZh,
          slug: slugifyWithHash(`${result.titleEn}-${newsId}-zh`),
          excerpt: result.summaryZh,
          aiSummary: result.summaryZh,
          keyTakeaways: result.keyTakeawaysZh,
          reviewStatus: "pending_review",
          translatedAt: new Date(),
        },
        create: {
          newsId,
          language: "ZH",
          title: result.titleZh,
          slug: slugifyWithHash(`${result.titleEn}-${newsId}-zh`),
          excerpt: result.summaryZh,
          aiSummary: result.summaryZh,
          keyTakeaways: result.keyTakeawaysZh,
          reviewStatus: "pending_review",
          translatedAt: new Date(),
        },
      }),
    ]);
  }
}

export const translationService = new TranslationService();
