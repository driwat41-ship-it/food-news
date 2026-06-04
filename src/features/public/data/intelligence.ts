import type { Prisma } from "@prisma/client";
import { prisma } from "../../../services/database/prisma";
import { getPagination } from "../lib/pagination";
import type { PaginatedResult, PublicBrandCard, PublicBriefEntitySignal, PublicBriefEvent, PublicBriefSignal, PublicCategoryCard, PublicCountryCard, PublicDailyBrief, PublicNewsCard, PublicReportCard } from "../types";

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

const briefProcessedNewsWhere: Prisma.NewsWhereInput = {
  status: { in: ["PUBLISHED", "REVIEW", "INGESTED"] },
  duplicateOfId: null,
  aiProcessedAt: { not: null },
};

function signalScore(news: any) {
  const quality = Number(news.qualityScore ?? 0);
  const relevance = Number(news.relevanceScore ?? 0);
  const confidence = Number(news.aiConfidenceScore ?? 0);
  return Math.round(Math.max(quality, relevance, confidence) * 100);
}

function mapBriefSignal(news: any, signalType: PublicBriefSignal["signalType"] = "news"): PublicBriefSignal {
  const card = mapNews(news);
  return {
    ...card,
    score: signalScore(news),
    confidence: news.aiConfidenceScore,
    signalType,
  };
}

function sourceHref(news?: { slug?: string | null } | null) {
  return news?.slug ? `/news/${news.slug}` : null;
}

function formatMoney(amount?: unknown, currency?: string | null) {
  if (!amount) return null;
  const value = Number(amount);
  if (!Number.isFinite(value)) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency ?? "USD",
    maximumFractionDigits: value >= 1_000_000 ? 0 : 2,
    notation: value >= 1_000_000 ? "compact" : "standard",
  }).format(value);
}

function briefEntityScore(count: number, confidence?: number | null) {
  return Math.round(count * 10 + Number(confidence ?? 0) * 100);
}

function buildExecutiveSummary(input: {
  processedNewsCount: number;
  topSignals: PublicBriefSignal[];
  expansionSignals: PublicBriefEvent[];
  fundingAndMna: PublicBriefEvent[];
  productLaunches: PublicBriefEvent[];
  brandsToWatch: PublicBriefEntitySignal[];
  countriesToWatch: PublicBriefEntitySignal[];
}) {
  const topSignal = input.topSignals[0];
  const topBrand = input.brandsToWatch[0];
  const topCountry = input.countriesToWatch[0];
  const lines = [
    input.processedNewsCount
      ? `${input.processedNewsCount} AI-processed articles are contributing to today's brief, ranked by quality, relevance, and extraction confidence.`
      : "No AI-processed articles are available for today's brief yet.",
  ];
  if (topSignal) lines.push(`The strongest signal is "${topSignal.title}"${topSignal.category ? ` in ${topSignal.category}` : ""}, with a ${topSignal.score || "quality"} signal score.`);
  if (input.expansionSignals.length || input.fundingAndMna.length || input.productLaunches.length) {
    lines.push(`${input.expansionSignals.length} expansion signals, ${input.fundingAndMna.length} funding or M&A signals, and ${input.productLaunches.length} product launch signals need analyst attention.`);
  }
  if (topBrand || topCountry) {
    lines.push(`${topBrand ? `${topBrand.name} is the leading brand to watch` : "Brand watch data is pending"}${topCountry ? `, while ${topCountry.name} is the most active country signal` : ""}.`);
  }
  return lines;
}

export async function getDailyBriefData(): Promise<PublicDailyBrief> {
  const [topNews, expansionSignals, fundingEvents, productLaunches, brandGroups, countryGroups, processedNewsCount] = await Promise.all([
    prisma.news.findMany({
      where: briefProcessedNewsWhere,
      include: newsInclude,
      orderBy: [{ qualityScore: "desc" }, { relevanceScore: "desc" }, { aiConfidenceScore: "desc" }, { publishedAt: "desc" }],
      take: 8,
    }),
    prisma.storeExpansion.findMany({
      where: { news: briefProcessedNewsWhere },
      include: { brand: true, country: true, news: { include: newsInclude } },
      orderBy: [{ announcedAt: "desc" }, { createdAt: "desc" }],
      take: 6,
    }),
    prisma.fundingEvent.findMany({
      where: { news: briefProcessedNewsWhere },
      include: { brand: true, country: true, news: { include: newsInclude } },
      orderBy: [{ announcedAt: "desc" }, { createdAt: "desc" }],
      take: 6,
    }),
    prisma.productLaunch.findMany({
      where: { news: briefProcessedNewsWhere },
      include: { brand: true, country: true, category: true, news: { include: newsInclude } },
      orderBy: [{ launchDate: "desc" }, { createdAt: "desc" }],
      take: 6,
    }),
    prisma.brandMention.groupBy({
      by: ["brandId"],
      where: { news: briefProcessedNewsWhere },
      _count: { brandId: true },
      _avg: { confidence: true },
      orderBy: { _count: { brandId: "desc" } },
      take: 6,
    }),
    prisma.countryMention.groupBy({
      by: ["countryId"],
      where: { news: briefProcessedNewsWhere },
      _count: { countryId: true },
      _avg: { confidence: true },
      orderBy: { _count: { countryId: "desc" } },
      take: 6,
    }),
    prisma.news.count({ where: briefProcessedNewsWhere }),
  ]);

  const [brands, countries] = await Promise.all([
    prisma.brand.findMany({
      where: { id: { in: brandGroups.map((group) => group.brandId) } },
      include: { mentions: { where: { news: briefProcessedNewsWhere }, include: { news: { include: newsInclude } }, orderBy: { createdAt: "desc" }, take: 1 } },
    }),
    prisma.country.findMany({
      where: { id: { in: countryGroups.map((group) => group.countryId) } },
      include: { mentions: { where: { news: briefProcessedNewsWhere }, include: { news: { include: newsInclude } }, orderBy: { createdAt: "desc" }, take: 1 } },
    }),
  ]);

  const brandById = new Map(brands.map((brand) => [brand.id, brand]));
  const countryById = new Map(countries.map((country) => [country.id, country]));
  const topSignals = topNews.map((news) => mapBriefSignal(news));

  const brief: PublicDailyBrief = {
    generatedAt: new Date(),
    processedNewsCount,
    executiveSummary: [],
    topSignals,
    expansionSignals: expansionSignals.map((signal) => ({
      id: signal.id,
      title: signal.title,
      summary: signal.news?.aiSummary ?? signal.news?.excerpt ?? `${signal.expansionType}${signal.city ? ` in ${signal.city}` : ""}`,
      brand: signal.brand?.name,
      country: signal.country?.name,
      href: sourceHref(signal.news),
      date: signal.announcedAt ?? signal.openedAt ?? signal.createdAt,
      amountLabel: signal.storeCount ? `${signal.storeCount} stores` : signal.expansionType,
      score: signal.news ? signalScore(signal.news) : 0,
    })),
    fundingAndMna: fundingEvents.map((event) => ({
      id: event.id,
      title: event.title,
      summary: event.summary ?? event.news?.aiSummary ?? event.news?.excerpt,
      brand: event.brand?.name,
      country: event.country?.name,
      href: sourceHref(event.news),
      date: event.announcedAt ?? event.createdAt,
      amountLabel: formatMoney(event.amount, event.currency) ?? event.eventType,
      score: event.news ? signalScore(event.news) : 0,
    })),
    productLaunches: productLaunches.map((launch) => ({
      id: launch.id,
      title: launch.title,
      summary: launch.description ?? launch.news?.aiSummary ?? launch.news?.excerpt,
      brand: launch.brand?.name,
      country: launch.country?.name,
      category: launch.category?.name,
      href: sourceHref(launch.news),
      date: launch.launchDate ?? launch.createdAt,
      amountLabel: launch.industryType ?? launch.category?.industryType ?? null,
      score: launch.news ? signalScore(launch.news) : 0,
    })),
    brandsToWatch: brandGroups
      .map((group) => {
        const brand = brandById.get(group.brandId);
        if (!brand) return null;
        return {
          id: brand.id,
          slug: brand.slug,
          name: brand.name,
          description: brand.description,
          context: brand.industryType,
          count: group._count.brandId,
          score: briefEntityScore(group._count.brandId, group._avg.confidence),
          href: `/brands/${brand.slug}`,
          latestSignal: brand.mentions[0]?.news ? mapBriefSignal(brand.mentions[0].news) : null,
        };
      })
      .filter(Boolean) as PublicBriefEntitySignal[],
    countriesToWatch: countryGroups
      .map((group) => {
        const country = countryById.get(group.countryId);
        if (!country) return null;
        return {
          id: country.id,
          slug: country.slug,
          name: country.name,
          description: country.region,
          context: country.subregion,
          count: group._count.countryId,
          score: briefEntityScore(group._count.countryId, group._avg.confidence),
          href: `/countries/${country.slug}`,
          latestSignal: country.mentions[0]?.news ? mapBriefSignal(country.mentions[0].news) : null,
        };
      })
      .filter(Boolean) as PublicBriefEntitySignal[],
  };

  brief.executiveSummary = buildExecutiveSummary(brief);
  return brief;
}

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
