import type { SearchFilters, SearchSort, SearchType } from "../types";

const allowedTypes = new Set<SearchType>(["all", "news", "brands", "countries", "categories", "reports"]);
const allowedSorts = new Set<SearchSort>(["relevance", "latest", "most-mentioned"]);

export function parseSearchParams(params: URLSearchParams): SearchFilters {
  const limit = Math.min(50, Math.max(1, Number(params.get("limit") ?? 20) || 20));
  const page = Math.max(1, Number(params.get("page") ?? 1) || 1);
  const type = params.get("type") as SearchType;
  const sort = params.get("sort") as SearchSort;
  return {
    q: (params.get("q") ?? "").trim(),
    type: allowedTypes.has(type) ? type : "all",
    category: params.get("category") ?? undefined,
    country: params.get("country") ?? undefined,
    brand: params.get("brand") ?? undefined,
    language: params.get("language")?.toUpperCase(),
    dateFrom: params.get("dateFrom") ?? params.get("from") ?? undefined,
    dateTo: params.get("dateTo") ?? params.get("to") ?? undefined,
    page,
    limit,
    sort: allowedSorts.has(sort) ? sort : "relevance",
  };
}

export function getOffset(filters: Pick<SearchFilters, "page" | "limit">) {
  return (filters.page - 1) * filters.limit;
}

export function buildNewsWhere(filters: SearchFilters) {
  return {
    status: { in: ["PUBLISHED", "REVIEW", "INGESTED"] },
    category: filters.category ? { slug: filters.category } : undefined,
    primaryCountry: filters.country ? { slug: filters.country } : undefined,
    language: filters.language || undefined,
    brandMentions: filters.brand ? { some: { brand: { slug: filters.brand } } } : undefined,
    publishedAt: {
      gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      lte: filters.dateTo ? new Date(filters.dateTo) : undefined,
    },
    OR: filters.q
      ? [
          { title: { contains: filters.q, mode: "insensitive" } },
          { excerpt: { contains: filters.q, mode: "insensitive" } },
          { aiSummary: { contains: filters.q, mode: "insensitive" } },
          { translations: { some: { title: { contains: filters.q, mode: "insensitive" } } } },
        ]
      : undefined,
  };
}

export function buildNewsOrderBy(sort: SearchSort) {
  if (sort === "latest") return { publishedAt: "desc" as const };
  if (sort === "most-mentioned") return { brandMentions: { _count: "desc" as const } };
  return [{ relevanceScore: "desc" as const }, { publishedAt: "desc" as const }];
}

export function buildPostgresNewsSearchSql(filters: SearchFilters) {
  const orderBy = filters.sort === "latest"
    ? 'n."publishedAt" DESC NULLS LAST'
    : filters.sort === "most-mentioned"
      ? 'brand_count DESC, n."publishedAt" DESC NULLS LAST'
      : 'rank DESC, trigram_score DESC, n."publishedAt" DESC NULLS LAST';

  return `
    SELECT n.id,
      ts_rank_cd(n."searchVector", plainto_tsquery('simple', $1)) AS rank,
      similarity(n.title, $1) AS trigram_score,
      COUNT(bm."brandId") AS brand_count
    FROM "News" n
    LEFT JOIN "BrandMention" bm ON bm."newsId" = n.id
    WHERE n.status IN ('PUBLISHED', 'REVIEW', 'INGESTED')
      AND ($1 = '' OR n."searchVector" @@ plainto_tsquery('simple', $1) OR similarity(n.title, $1) > 0.18 OR n.title ILIKE '%' || $1 || '%')
    GROUP BY n.id
    ORDER BY ${orderBy}
    LIMIT ${filters.limit} OFFSET ${getOffset(filters)}
  `.trim();
}
