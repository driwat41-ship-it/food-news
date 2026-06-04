import { prisma } from "../../../services/database/prisma";
import { getPagination } from "../../public/lib/pagination";

type SearchParams = Record<string, string | string[] | undefined>;
const pick = (params: SearchParams = {}, key: string) => Array.isArray(params[key]) ? params[key]?.[0] : params[key];

export async function getAdminDashboardData() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [totalArticles, articlesToday, pendingReviews, failedJobs, activeSources, aiProcessedArticles, latestErrors, recentArticles] = await Promise.all([
    prisma.news.count(),
    prisma.news.count({ where: { createdAt: { gte: today } } }),
    prisma.news.count({ where: { aiReviewStatus: "pending_review" } }),
    prisma.jobExecution.count({ where: { status: "FAILED" } }),
    prisma.source.count({ where: { active: true } }),
    prisma.news.count({ where: { aiProcessedAt: { not: null } } }),
    prisma.jobExecution.findMany({ where: { status: "FAILED" }, orderBy: { createdAt: "desc" }, take: 8, include: { job: true, source: true } }),
    prisma.news.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { source: true, category: true } }),
  ]);
  return { totalArticles, articlesToday, pendingReviews, failedJobs, activeSources, aiProcessedArticles, latestErrors, recentArticles };
}

export async function getAdminNews(params: SearchParams = {}) {
  const { page, pageSize, skip, take } = getPagination(params);
  const q = pick(params, "q")?.trim();
  const where: any = {
    status: pick(params, "status") || undefined,
    sourceId: pick(params, "source") || undefined,
    categoryId: pick(params, "category") || undefined,
    language: pick(params, "language") || undefined,
    aiReviewStatus: pick(params, "aiReviewStatus") || undefined,
    OR: q ? [{ title: { contains: q, mode: "insensitive" } }, { originalUrl: { contains: q, mode: "insensitive" } }, { canonicalUrl: { contains: q, mode: "insensitive" } }] : undefined,
    publishedAt: { gte: pick(params, "from") ? new Date(String(pick(params, "from"))) : undefined, lte: pick(params, "to") ? new Date(String(pick(params, "to"))) : undefined },
  };
  const [items, total, sources, categories] = await Promise.all([
    prisma.news.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: { source: true, category: true, translations: true } }),
    prisma.news.count({ where }),
    prisma.source.findMany({ orderBy: { name: "asc" }, take: 500 }),
    prisma.category.findMany({ orderBy: { name: "asc" }, take: 200 }),
  ]);
  return { items, sources, categories, page, pageSize, total, hasNextPage: skip + items.length < total };
}

export async function getAdminNewsDetail(id: string) {
  return prisma.news.findUnique({ where: { id }, include: { source: true, category: true, translations: true, brandMentions: { include: { brand: true } }, countryMentions: { include: { country: true } }, tags: { include: { tag: true } }, productLaunches: true, franchiseOpportunities: true, fundingEvents: true, aiProcessingLogs: { orderBy: { createdAt: "desc" }, take: 10 } } });
}

export async function getReviewOverview() {
  const [translations, productLaunches, franchiseOpportunities, fundingEvents] = await Promise.all([
    prisma.newsTranslation.count({ where: { reviewStatus: "pending_review" } }),
    prisma.productLaunch.count({ where: { aiReviewStatus: "pending_review" } }),
    prisma.franchiseOpportunity.count({ where: { aiReviewStatus: "pending_review" } }),
    prisma.fundingEvent.count({ where: { aiReviewStatus: "pending_review" } }),
  ]);
  return { translations, productLaunches, franchiseOpportunities, fundingEvents };
}

export async function getReviewQueue(type: "translations" | "productLaunches" | "franchiseOpportunities" | "fundingEvents") {
  if (type === "translations") return prisma.newsTranslation.findMany({ where: { reviewStatus: "pending_review" }, include: { news: true }, orderBy: { updatedAt: "desc" }, take: 100 });
  if (type === "productLaunches") return prisma.productLaunch.findMany({ where: { aiReviewStatus: "pending_review" }, include: { news: true, brand: true, country: true }, orderBy: { updatedAt: "desc" }, take: 100 });
  if (type === "franchiseOpportunities") return prisma.franchiseOpportunity.findMany({ where: { aiReviewStatus: "pending_review" }, include: { news: true, brand: true, country: true }, orderBy: { updatedAt: "desc" }, take: 100 });
  return prisma.fundingEvent.findMany({ where: { aiReviewStatus: "pending_review" }, include: { news: true, brand: true, country: true }, orderBy: { updatedAt: "desc" }, take: 100 });
}

export async function getAdminBrands() { return prisma.brand.findMany({ orderBy: { updatedAt: "desc" }, include: { headquartersCountry: true, category: true }, take: 300 }); }
export async function getAdminBrand(id: string) { return prisma.brand.findUnique({ where: { id } }); }
export async function getAdminCountries() { return prisma.country.findMany({ orderBy: { name: "asc" }, take: 300 }); }
export async function getAdminCountry(id: string) { return prisma.country.findUnique({ where: { id } }); }
export async function getAdminCategories() { return prisma.category.findMany({ orderBy: { name: "asc" }, include: { parent: true }, take: 300 }); }
export async function getAdminCategory(id: string) { return prisma.category.findUnique({ where: { id } }); }
export async function getAdminSources() { return prisma.source.findMany({ orderBy: { updatedAt: "desc" }, include: { country: true, category: true }, take: 500 }); }
export async function getAdminSource(id: string) { return prisma.source.findUnique({ where: { id }, include: { country: true, category: true, jobExecutions: { orderBy: { createdAt: "desc" }, take: 10 } } }); }
export async function getAdminJobs() { return prisma.systemJob.findMany({ orderBy: { updatedAt: "desc" }, include: { executions: { orderBy: { createdAt: "desc" }, take: 1 } }, take: 300 }); }
export async function getAdminJob(id: string) { return prisma.systemJob.findUnique({ where: { id }, include: { executions: { orderBy: { createdAt: "desc" }, take: 100, include: { source: true } } } }); }
export async function getAdminLogs() { const [aiLogs, jobExecutions, auditLogs] = await Promise.all([prisma.aIProcessingLog.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { news: true } }), prisma.jobExecution.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { job: true, source: true } }), prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 })]); return { aiLogs, jobExecutions, auditLogs }; }
export async function getAdminFormOptions() { const [countries, categories] = await Promise.all([prisma.country.findMany({ orderBy: { name: "asc" }, take: 300 }), prisma.category.findMany({ orderBy: { name: "asc" }, take: 300 })]); return { countries, categories }; }
