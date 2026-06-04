import type { IndustryType, Language } from "@prisma/client";

export type AIReviewStatus = "pending_review" | "approved" | "rejected";

export interface AIProcessingJobPayload {
  newsId: string;
  taskTypes?: Array<"summarize" | "classify" | "extract_entities" | "translate">;
  force?: boolean;
}

export interface CleanArticleContent {
  newsId: string;
  title: string;
  body: string;
  sourceUrl?: string | null;
  publishedAt?: Date | null;
  sourceName?: string | null;
}

export interface MentionCandidate {
  name: string;
  confidence: number;
  evidence?: string;
}

export interface ProductLaunchCandidate {
  title: string;
  description?: string;
  brandName?: string;
  countryName?: string;
  launchDate?: string;
  confidence: number;
}

export interface FranchiseOpportunityCandidate {
  title: string;
  description?: string;
  brandName?: string;
  countryName?: string;
  investmentMin?: number;
  investmentMax?: number;
  currency?: string;
  confidence: number;
}

export interface FundingEventCandidate {
  title: string;
  eventType: string;
  brandName?: string;
  countryName?: string;
  amount?: number;
  currency?: string;
  announcedAt?: string;
  investors?: string[];
  confidence: number;
}

export interface AIArticleAnalysisResult {
  titleEn: string;
  titleZh: string;
  summaryEn: string;
  summaryZh: string;
  keyTakeawaysEn: string[];
  keyTakeawaysZh: string[];
  detectedLanguage: Language;
  industryType: IndustryType;
  category: string;
  tags: string[];
  brandMentions: MentionCandidate[];
  countryMentions: MentionCandidate[];
  productLaunches: ProductLaunchCandidate[];
  franchiseOpportunities: FranchiseOpportunityCandidate[];
  fundingEvents: FundingEventCandidate[];
  confidenceScore: number;
}

export interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AIJsonResponse<T> {
  data: T;
  usage: AIUsage;
  model: string;
  raw: string;
}
