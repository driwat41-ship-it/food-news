export type LocaleCode = "en" | "zh";

export interface PublicNewsCard {
  id: string;
  slug: string;
  title: string;
  translatedTitle?: string | null;
  summary?: string | null;
  source?: string | null;
  category?: string | null;
  country?: string | null;
  brands: string[];
  tags: string[];
  publishedAt?: Date | null;
  language?: string | null;
}

export interface PublicBrandCard {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  industryType?: string | null;
  mentionedCount: number;
}

export interface PublicCountryCard {
  id: string;
  slug: string;
  name: string;
  region?: string | null;
  mentionedCount: number;
}

export interface PublicCategoryCard {
  id: string;
  slug: string;
  name: string;
  industryType?: string | null;
  newsCount: number;
}

export interface PublicReportCard {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  reportType: "daily" | "weekly" | "monthly" | "market";
  publishedAt?: Date | null;
}

export interface PublicBriefSignal {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  source?: string | null;
  category?: string | null;
  country?: string | null;
  brands: string[];
  tags: string[];
  publishedAt?: Date | null;
  score: number;
  confidence?: number | null;
  signalType: "news" | "expansion" | "funding" | "launch";
}

export interface PublicBriefEvent {
  id: string;
  title: string;
  summary?: string | null;
  brand?: string | null;
  country?: string | null;
  category?: string | null;
  href?: string | null;
  date?: Date | null;
  amountLabel?: string | null;
  score: number;
}

export interface PublicBriefEntitySignal {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  context?: string | null;
  count: number;
  score: number;
  href: string;
  latestSignal?: PublicBriefSignal | null;
}

export interface PublicDailyBrief {
  generatedAt: Date;
  processedNewsCount: number;
  executiveSummary: string[];
  topSignals: PublicBriefSignal[];
  expansionSignals: PublicBriefEvent[];
  fundingAndMna: PublicBriefEvent[];
  productLaunches: PublicBriefEvent[];
  brandsToWatch: PublicBriefEntitySignal[];
  countriesToWatch: PublicBriefEntitySignal[];
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
}
