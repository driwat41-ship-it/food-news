import { prisma } from "../../../services/database/prisma";
import { getPagination } from "../lib/pagination";
import type { PaginatedResult, PublicBrandCard, PublicCategoryCard, PublicCountryCard, PublicNewsCard, PublicReportCard } from "../types";

type SearchParams = Record<string, string | string[] | undefined>;

function value(params: SearchParams | undefined, key: string) {
  const item = params?.[key];
  return Array.isArray(item) ? item[0] : item;
}

function mapNews(news: any): PublicNewsCard {
  const zh = news.translations?.find((translation: any) => translation.language === "ZH");
  const en = news.translations?.find((translation: any) => translation.language === "EN");
  return {
    id: news.id,
    slug: news.slug,
    title: news.title,
    translatedTitle: zh?.title ?? en?.title,
    summary: en?.aiSummary ?? news.aiSummary ?? news.excerpt,
    source: news.source?.name,
    category: news.category?.name,
    country: news.primaryCountry?.name ?? news.countryMentions?.[0]?.country?.name,
    brands: news.brandMentions?.map((mention: any) => mention.brand.name).filter(Boolean) ?? [],
    tags: news.tags?.map((entry: any) => entry.tag.name).filter(Boolean) ?? [],
    publishedAt: news.publishedAt,
    language: news.language,
  };
}

const newsInclude = {
  source: true,
  category: true,
  primaryCountry: true,
  translations: true,
  brandMentions: { include: { brand: true }, take: 6 },
  countryMentions: { include: { country: true }, take: 3 },
  tags: { include: { tag: true }, take: 8 },
} as const;

export async function getHomepageData() {
  const [latestNews, brands, countries, categories, reports] = await Promise.all([
    prisma.news.findMany({ where: { status: { in: ["PUBLISHED", "REVIEW", "INGESTED"] } }, include: newsInclude, orderBy: { publishedAt: "desc" }, take: 18 }),
    prisma.brand.findMany({ include: { _count: { select: { mentions: true } } }, orderBy: { mentions: { _count: "desc" } }, take: 10 }),
    prisma.country.findMany({ include: { _count: { select: { mentions: true } } }, orderBy: { mentions: { _count: "desc" } }, take: 10 }),
    prisma.category.findMany({ include: { _count: { select: { news: true } } }, orderBy: { news: { _count: "desc" } }, take: 10 }),
    getFeaturedReports(6),
  ]);

  return {
    latestNews: latestNews.map(mapNews),
    trendingBrands: brands.map((brand: any) => ({ id: brand.id, slug: brand.slug, name: brand.name, description: brand.description, industryType: brand.industryType, mentionedCount: brand._count.mentions })),
    trendingCountries: countries.map((country: any) => ({ id: country.id, slug: country.slug, name: country.name, region: country.region, mentionedCount: country._count.mentions })),
    trendingCategories: categories.map((category: any) => ({ id: category.id, slug: category.slug, name: category.name, industryType: category.industryType, newsCount: category._count.news })),
    reports,
  };
}

export async function getNewsList(params: SearchParams = {}): Promise<PaginatedResult<PublicNewsCard>> {
  const { page, pageSize, skip, take } = getPagination(params);
  const sort = value(params, "sort") ?? "latest";
  const query = value(params, "q")?.trim();
  const where: any = {
    status: { in: ["PUBLISHED", "REVIEW", "INGESTED"] },
    OR: query
      ? [
          { title: { contains: query, mode: "insensitive" } },
          { excerpt: { contains: query, mode: "insensitive" } },
          { body: { contains: query, mode: "insensitive" } },
          { translations: { some: { title: { contains: query, mode: "insensitive" } } } },
        ]
      : undefined,
    category: value(params, "category") ? { slug: value(params, "category") } : undefined,
    primaryCountry: value(params, "country") ? { slug: value(params, "country") } : undefined,
    language: value(params, "language") ? String(value(params, "language")).toUpperCase() : undefined,
    brandMentions: value(params, "brand") ? { some: { brand: { slug: value(params, "brand") } } } : undefined,
    publishedAt: {
      gte: value(params, "from") ? new Date(String(value(params, "from"))) : undefined,
      lte: value(params, "to") ? new Date(String(value(params, "to"))) : undefined,
    },
  };

  const orderBy = sort === "most-relevant" ? { relevanceScore: "desc" as const } : sort === "most-mentioned" ? { brandMentions: { _count: "desc" as const } } : { publishedAt: "desc" as const };
  const [items, total] = await Promise.all([
    prisma.news.findMany({ where, include: newsInclude, orderBy, skip, take }),
    prisma.news.count({ where }),
  ]);

  return { items: items.map(mapNews), page, pageSize, total, hasNextPage: skip + items.length < total };
}

export async function getNewsBySlug(slug: string) {
  const news = await prisma.news.findUnique({ where: { slug }, include: { ...newsInclude, productLaunches: true, franchiseOpportunities: true, fundingEvents: true } });
  if (!news) return null;
  const related = await prisma.news.findMany({ where: { id: { not: news.id }, categoryId: news.categoryId }, include: newsInclude, orderBy: { publishedAt: "desc" }, take: 6 });
  return { news, card: mapNews(news), related: related.map(mapNews) };
}

export async function getBrands(): Promise<PublicBrandCard[]> {
  const brands = await prisma.brand.findMany({ include: { _count: { select: { mentions: true } } }, orderBy: { name: "asc" }, take: 200 });
  return brands.map((brand: any) => ({ id: brand.id, slug: brand.slug, name: brand.name, description: brand.description, industryType: brand.industryType, mentionedCount: brand._count.mentions }));
}

export async function getBrandBySlug(slug: string) {
  const brand = await prisma.brand.findUnique({ where: { slug }, include: { _count: { select: { mentions: true, productLaunches: true, fundingEvents: true, franchiseOpportunities: true } } } });
  if (!brand) return null;
  const latestNews = await prisma.news.findMany({ where: { brandMentions: { some: { brandId: brand.id } } }, include: newsInclude, orderBy: { publishedAt: "desc" }, take: 12 });
  const [productLaunches, fundingEvents, franchiseOpportunities, storeExpansions] = await Promise.all([
    prisma.productLaunch.findMany({ where: { brandId: brand.id }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.fundingEvent.findMany({ where: { brandId: brand.id }, orderBy: { announcedAt: "desc" }, take: 8 }),
    prisma.franchiseOpportunity.findMany({ where: { brandId: brand.id }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.storeExpansion.findMany({ where: { brandId: brand.id }, orderBy: { announcedAt: "desc" }, take: 8 }),
  ]);
  return { brand, latestNews: latestNews.map(mapNews), productLaunches, fundingEvents, franchiseOpportunities, storeExpansions };
}

export async function getCountries(): Promise<PublicCountryCard[]> {
  const countries = await prisma.country.findMany({ include: { _count: { select: { mentions: true } } }, orderBy: { name: "asc" }, take: 300 });
  return countries.map((country: any) => ({ id: country.id, slug: country.slug, name: country.name, region: country.region, mentionedCount: country._count.mentions }));
}

export async function getCountryBySlug(slug: string) {
  const country = await prisma.country.findUnique({ where: { slug } });
  if (!country) return null;
  const [localNews, activeBrands, expansions, trends, franchiseOpportunities] = await Promise.all([
    prisma.news.findMany({ where: { OR: [{ primaryCountryId: country.id }, { countryMentions: { some: { countryId: country.id } } }] }, include: newsInclude, orderBy: { publishedAt: "desc" }, take: 18 }),
    prisma.brand.findMany({ where: { OR: [{ headquartersCountryId: country.id }, { mentions: { some: { news: { countryMentions: { some: { countryId: country.id } } } } } }] }, take: 12 }),
    prisma.storeExpansion.findMany({ where: { countryId: country.id }, orderBy: { announcedAt: "desc" }, take: 10 }),
    prisma.trend.findMany({ where: { countryId: country.id }, include: { snapshots: { orderBy: { snapshotAt: "desc" }, take: 1 } }, take: 10 }),
    prisma.franchiseOpportunity.findMany({ where: { countryId: country.id }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);
  return { country, localNews: localNews.map(mapNews), activeBrands, expansions, trends, franchiseOpportunities };
}

export async function getCategories(): Promise<PublicCategoryCard[]> {
  const categories = await prisma.category.findMany({ include: { _count: { select: { news: true } } }, orderBy: { name: "asc" }, take: 100 });
  return categories.map((category: any) => ({ id: category.id, slug: category.slug, name: category.name, industryType: category.industryType, newsCount: category._count.news }));
}

export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({ where: { slug }, include: { _count: { select: { news: true } } } });
  if (!category) return null;
  const [news, trends] = await Promise.all([
    prisma.news.findMany({ where: { categoryId: category.id }, include: newsInclude, orderBy: { publishedAt: "desc" }, take: 24 }),
    prisma.trend.findMany({ where: { categoryId: category.id }, include: { snapshots: { orderBy: { snapshotAt: "desc" }, take: 1 } }, take: 12 }),
  ]);
  return { category, news: news.map(mapNews), trends };
}

export async function getFeaturedReports(limit = 24): Promise<PublicReportCard[]> {
  const [daily, weekly, monthly, market] = await Promise.all([
    prisma.dailyReport.findMany({ orderBy: { publishedAt: "desc" }, take: limit }),
    prisma.weeklyReport.findMany({ orderBy: { publishedAt: "desc" }, take: limit }),
    prisma.monthlyReport.findMany({ orderBy: { publishedAt: "desc" }, take: limit }),
    prisma.marketReport.findMany({ orderBy: { publishedAt: "desc" }, take: limit }),
  ]);
  return [
    ...daily.map((report: any) => ({ id: report.id, slug: report.slug, title: report.title, summary: report.summary, reportType: "daily" as const, publishedAt: report.publishedAt })),
    ...weekly.map((report: any) => ({ id: report.id, slug: report.slug, title: report.title, summary: report.summary, reportType: "weekly" as const, publishedAt: report.publishedAt })),
    ...monthly.map((report: any) => ({ id: report.id, slug: report.slug, title: report.title, summary: report.summary, reportType: "monthly" as const, publishedAt: report.publishedAt })),
    ...market.map((report: any) => ({ id: report.id, slug: report.slug, title: report.title, summary: report.summary, reportType: "market" as const, publishedAt: report.publishedAt })),
  ].sort((a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime()).slice(0, limit);
}

export async function getReportBySlug(slug: string) {
  const [daily, weekly, monthly, market] = await Promise.all([
    prisma.dailyReport.findUnique({ where: { slug }, include: { news: { include: { news: { include: newsInclude } } } } }),
    prisma.weeklyReport.findUnique({ where: { slug }, include: { news: { include: { news: { include: newsInclude } } } } }),
    prisma.monthlyReport.findUnique({ where: { slug }, include: { news: { include: { news: { include: newsInclude } } } } }),
    prisma.marketReport.findUnique({ where: { slug } }),
  ]);
  const report = daily ?? weekly ?? monthly ?? market;
  if (!report) return null;
  const relatedNews = "news" in report && Array.isArray((report as any).news) ? (report as any).news.map((entry: any) => mapNews(entry.news)) : [];
  return { report, relatedNews };
}

export async function searchIntelligence(params: SearchParams): Promise<PaginatedResult<PublicNewsCard>> {
  const query = value(params, "q")?.trim();
  if (!query) return { items: [], page: 1, pageSize: 24, total: 0, hasNextPage: false };
  return getNewsList({ ...params, sort: value(params, "sort") ?? "most-relevant", q: query });
}
