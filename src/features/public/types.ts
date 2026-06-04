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

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
}
