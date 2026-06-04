import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "../../../services/database/prisma";
import { logger } from "../../../lib/logger/structured-logger";
import { aiConfig } from "../config/ai.config";
import { buildArticleAnalysisPrompt } from "../prompts/article-analysis.prompt";
import type { AIArticleAnalysisResult, AIProcessingJobPayload, FranchiseOpportunityCandidate, FundingEventCandidate, MentionCandidate, ProductLaunchCandidate } from "../types";
import { clampConfidence } from "../utils/json";
import { aiClientService, AIClientService } from "./ai-client.service";
import { classificationService, ClassificationService } from "./classification.service";
import { contentCleanerService, ContentCleanerService } from "./content-cleaner.service";
import { entityExtractionService, EntityExtractionService } from "./entity-extraction.service";
import { franchiseDetectorService, FranchiseDetectorService } from "./franchise-detector.service";
import { fundingDetectorService, FundingDetectorService } from "./funding-detector.service";
import { languageDetectorService, LanguageDetectorService } from "./language-detector.service";
import { productLaunchDetectorService, ProductLaunchDetectorService } from "./product-launch-detector.service";
import { summaryService, SummaryService } from "./summary.service";
import { taggingService, TaggingService } from "./tagging.service";
import { translationService, TranslationService } from "./translation.service";

function compactJsonObject(entries: Array<[string, Prisma.InputJsonValue | undefined]>): Prisma.InputJsonObject {
  const json: Record<string, Prisma.InputJsonValue> = {};

  for (const [key, value] of entries) {
    if (value !== undefined) {
      json[key] = value;
    }
  }

  return json;
}

function mentionToJson(mention: MentionCandidate): Prisma.InputJsonObject {
  return compactJsonObject([
    ["name", mention.name],
    ["confidence", mention.confidence],
    ["evidence", mention.evidence],
  ]);
}

function productLaunchToJson(launch: ProductLaunchCandidate): Prisma.InputJsonObject {
  return compactJsonObject([
    ["title", launch.title],
    ["description", launch.description],
    ["brandName", launch.brandName],
    ["countryName", launch.countryName],
    ["launchDate", launch.launchDate],
    ["confidence", launch.confidence],
  ]);
}

function franchiseOpportunityToJson(opportunity: FranchiseOpportunityCandidate): Prisma.InputJsonObject {
  return compactJsonObject([
    ["title", opportunity.title],
    ["description", opportunity.description],
    ["brandName", opportunity.brandName],
    ["countryName", opportunity.countryName],
    ["investmentMin", opportunity.investmentMin],
    ["investmentMax", opportunity.investmentMax],
    ["currency", opportunity.currency],
    ["confidence", opportunity.confidence],
  ]);
}

function fundingEventToJson(event: FundingEventCandidate): Prisma.InputJsonObject {
  return compactJsonObject([
    ["title", event.title],
    ["eventType", event.eventType],
    ["brandName", event.brandName],
    ["countryName", event.countryName],
    ["amount", event.amount],
    ["currency", event.currency],
    ["announcedAt", event.announcedAt],
    ["investors", event.investors],
    ["confidence", event.confidence],
  ]);
}

function aiEntitiesToJsonObject(result: AIArticleAnalysisResult, summaries: ReturnType<SummaryService["normalize"]>): Prisma.InputJsonObject {
  return {
    brandMentions: result.brandMentions.map(mentionToJson),
    countryMentions: result.countryMentions.map(mentionToJson),
    keyTakeawaysEn: summaries.keyTakeawaysEn,
    keyTakeawaysZh: summaries.keyTakeawaysZh,
    productLaunches: result.productLaunches.map(productLaunchToJson),
    franchiseOpportunities: result.franchiseOpportunities.map(franchiseOpportunityToJson),
    fundingEvents: result.fundingEvents.map(fundingEventToJson),
  };
}

export class AIProcessingOrchestratorService {
  constructor(
    private readonly prisma: PrismaClient = defaultPrisma,
    private readonly aiClient: AIClientService = aiClientService,
    private readonly cleaner: ContentCleanerService = contentCleanerService,
    private readonly languageDetector: LanguageDetectorService = languageDetectorService,
    private readonly summary: SummaryService = summaryService,
    private readonly classification: ClassificationService = classificationService,
    private readonly translations: TranslationService = translationService,
    private readonly entities: EntityExtractionService = entityExtractionService,
    private readonly tagging: TaggingService = taggingService,
    private readonly productLaunches: ProductLaunchDetectorService = productLaunchDetectorService,
    private readonly franchises: FranchiseDetectorService = franchiseDetectorService,
    private readonly funding: FundingDetectorService = fundingDetectorService,
  ) {}

  async process(payload: AIProcessingJobPayload) {
    const news = await this.prisma.news.findUnique({
      where: { id: payload.newsId },
      include: { source: true, translations: true },
    });

    if (!news) throw new Error(`News article ${payload.newsId} was not found`);

    if (!payload.force && news.aiProcessedAt) {
      logger.info("Skipping already AI-processed article", { newsId: payload.newsId });
      return { newsId: payload.newsId, skipped: true };
    }

    const log = await this.prisma.aIProcessingLog.create({
      data: {
        newsId: news.id,
        taskType: payload.taskTypes?.join(",") ?? "full_article_analysis",
        provider: "openai",
        model: aiConfig.model,
        status: "RUNNING",
        startedAt: new Date(),
        metadata: { force: payload.force ?? false },
      },
    });

    try {
      const cleaned = this.cleaner.clean({
        newsId: news.id,
        title: news.title,
        body: news.body,
        excerpt: news.excerpt,
        sourceUrl: news.canonicalUrl ?? news.originalUrl,
        publishedAt: news.publishedAt,
        sourceName: news.source?.name,
      });

      if (!cleaned.body || cleaned.body.length < 100) {
        throw new Error("Article content is too short for AI processing");
      }

      const heuristicLanguage = this.languageDetector.detect(`${cleaned.title}\n${cleaned.body}`);
      const prompt = buildArticleAnalysisPrompt(cleaned);
      const completion = await this.aiClient.completeJson<AIArticleAnalysisResult>({ prompt });
      const result = this.normalizeResult(completion.data, heuristicLanguage);
      const summaries = this.summary.normalize(result);
      const categoryId = await this.prisma.$transaction(async (tx) => {
        const resolvedCategoryId = await this.classification.resolveCategory(result, tx);

        await this.translations.saveTranslations(news.id, result, tx);
        await this.entities.saveBrandMentions(news.id, result.brandMentions, tx);
        await this.entities.saveCountryMentions(news.id, result.countryMentions, tx);
        await this.tagging.saveTags(news.id, result.tags, resolvedCategoryId, tx);
        await this.productLaunches.save(news.id, result.productLaunches, resolvedCategoryId, tx);
        await this.franchises.save(news.id, result.franchiseOpportunities, tx);
        await this.funding.save(news.id, result.fundingEvents, tx);

        await tx.news.update({
          where: { id: news.id },
          data: {
            language: result.detectedLanguage,
            industryType: result.industryType,
            categoryId: resolvedCategoryId,
            aiSummary: summaries.summaryEn,
            aiSummaryModel: completion.model,
            aiSummaryGeneratedAt: new Date(),
            aiKeywords: result.tags,
            aiEntities: aiEntitiesToJsonObject(result, summaries),
            aiConfidenceScore: result.confidenceScore,
            aiReviewStatus: "pending_review",
            aiProcessedAt: new Date(),
            qualityScore: result.confidenceScore,
            status: "REVIEW",
          },
        });

        return resolvedCategoryId;
      });

      await this.prisma.aIProcessingLog.update({
        where: { id: log.id },
        data: {
          status: "SUCCEEDED",
          model: completion.model,
          promptTokens: completion.usage.promptTokens,
          completionTokens: completion.usage.completionTokens,
          totalTokens: completion.usage.totalTokens,
          finishedAt: new Date(),
          metadata: {
            categoryId,
            detectedLanguage: result.detectedLanguage,
            confidenceScore: result.confidenceScore,
            rawModelMetadata: { model: completion.model },
          },
        },
      });

      return { newsId: news.id, skipped: false, confidenceScore: result.confidenceScore };
    } catch (error) {
      await this.prisma.aIProcessingLog.update({
        where: { id: log.id },
        data: {
          status: "FAILED",
          finishedAt: new Date(),
          metadata: { error: error instanceof Error ? error.message : String(error) },
        },
      });

      throw error;
    }
  }

  private normalizeResult(result: AIArticleAnalysisResult, fallbackLanguage: AIArticleAnalysisResult["detectedLanguage"]): AIArticleAnalysisResult {
    return {
      ...result,
      titleEn: String(result.titleEn || "").trim(),
      titleZh: String(result.titleZh || "").trim(),
      detectedLanguage: result.detectedLanguage || fallbackLanguage,
      industryType: this.classification.normalizeIndustry(result.industryType),
      category: String(result.category || "Other").trim(),
      tags: (Array.isArray(result.tags) ? result.tags : []).map((tag) => String(tag).toLowerCase().trim()).filter(Boolean),
      brandMentions: Array.isArray(result.brandMentions) ? result.brandMentions : [],
      countryMentions: Array.isArray(result.countryMentions) ? result.countryMentions : [],
      productLaunches: Array.isArray(result.productLaunches) ? result.productLaunches : [],
      franchiseOpportunities: Array.isArray(result.franchiseOpportunities) ? result.franchiseOpportunities : [],
      fundingEvents: Array.isArray(result.fundingEvents) ? result.fundingEvents : [],
      confidenceScore: clampConfidence(result.confidenceScore),
    };
  }
}

export const aiProcessingOrchestratorService = new AIProcessingOrchestratorService();
