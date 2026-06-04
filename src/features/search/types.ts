export type SearchType = "all" | "news" | "brands" | "countries" | "categories" | "reports";
export type SearchSort = "relevance" | "latest" | "most-mentioned";

export interface SearchFilters {
  q: string;
  type: SearchType;
  category?: string;
  country?: string;
  brand?: string;
  language?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  limit: number;
  sort: SearchSort;
}

export interface SearchResultItem {
  id: string;
  type: Exclude<SearchType, "all">;
  title: string;
  slug: string;
  description?: string | null;
  url: string;
  publishedAt?: Date | null;
  meta?: Record<string, unknown>;
}
