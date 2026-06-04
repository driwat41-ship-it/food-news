import { Prisma } from "@prisma/client";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "../../../services/database/prisma";
import { buildNewsOrderBy, buildNewsWhere, buildPostgresNewsSearchSql, getOffset, parseSearchParams } from "../../../features/search/lib/search-query-builder";
import { logSearch } from "../../../features/search/lib/search-logger";
import type { SearchResultItem } from "../../../features/search/types";

function newsToResult(news: any): SearchResultItem {
  return { id: news.id, type: "news", title: news.translations?.[0]?.title ?? news.title, slug: news.slug, description: news.aiSummary ?? news.excerpt, url: `/news/${news.slug}`, publishedAt: news.publishedAt, meta: { source: news.source?.name, category: news.category?.name } };
}
const simpleResult = (type: SearchResultItem["type"], item: any): SearchResultItem => ({ id: item.id, type, title: item.title ?? item.name, slug: item.slug, description: item.summary ?? item.description ?? item.region, url: `/${type}/${item.slug}`, publishedAt: item.publishedAt ?? item.updatedAt, meta: { industryType: item.industryType } });
const insensitive = Prisma.QueryMode.insensitive;
const reportWhere = (q: string) => q ? { OR: [{ title: { contains: q, mode: insensitive } }, { summary: { contains: q, mode: insensitive } }] } : {};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filters = parseSearchParams(url.searchParams);
  const offset = getOffset(filters);
  const q = filters.q;
  const results: SearchResultItem[] = [];

  const includeNews = filters.type === "all" || filters.type === "news";
  if (includeNews) {
    const where = buildNewsWhere(filters);
    const take = filters.type === "news" ? filters.limit : Math.min(8, filters.limit);
    let news;

    if (filters.q) {
      try {
        const rankedIds = await prisma.$queryRawUnsafe<Array<{ id: string }>>(buildPostgresNewsSearchSql({ ...filters, limit: take }), filters.q);
        const ids = rankedIds.map((row) => row.id);
        const rows = ids.length
          ? await prisma.news.findMany({ where: { ...where, id: { in: ids } }, include: { translations: { where: { language: "EN" }, take: 1 }, source: true, category: true } })
          : [];
        const byId = new Map(rows.map((item) => [item.id, item]));
        news = ids.map((id) => byId.get(id)).filter(Boolean);
      } catch {
        news = await prisma.news.findMany({ where, include: { translations: { where: { language: "EN" }, take: 1 }, source: true, category: true }, orderBy: buildNewsOrderBy(filters.sort) as any, skip: filters.type === "news" ? offset : 0, take });
      }
    } else {
      news = await prisma.news.findMany({ where, include: { translations: { where: { language: "EN" }, take: 1 }, source: true, category: true }, orderBy: buildNewsOrderBy(filters.sort) as any, skip: filters.type === "news" ? offset : 0, take });
    }

    results.push(...news.map(newsToResult));
  }

  if (filters.type === "all" || filters.type === "brands") {
    const brands = await prisma.brand.findMany({ where: q ? { OR: [{ name: { contains: q, mode: insensitive } }, { description: { contains: q, mode: insensitive } }] } : {}, orderBy: { updatedAt: "desc" }, skip: filters.type === "brands" ? offset : 0, take: filters.type === "brands" ? filters.limit : 6 });
    results.push(...brands.map((item) => simpleResult("brands", item)));
  }
  if (filters.type === "all" || filters.type === "countries") {
    const countries = await prisma.country.findMany({ where: q ? { OR: [{ name: { contains: q, mode: insensitive } }, { region: { contains: q, mode: insensitive } }] } : {}, orderBy: { name: "asc" }, skip: filters.type === "countries" ? offset : 0, take: filters.type === "countries" ? filters.limit : 6 });
    results.push(...countries.map((item) => simpleResult("countries", item)));
  }
  if (filters.type === "all" || filters.type === "categories") {
    const categories = await prisma.category.findMany({ where: q ? { OR: [{ name: { contains: q, mode: insensitive } }, { description: { contains: q, mode: insensitive } }] } : {}, orderBy: { name: "asc" }, skip: filters.type === "categories" ? offset : 0, take: filters.type === "categories" ? filters.limit : 6 });
    results.push(...categories.map((item) => simpleResult("categories", item)));
  }
  if (filters.type === "all" || filters.type === "reports") {
    const reportTake = filters.type === "reports" ? filters.limit : 6;
    const reportSkip = filters.type === "reports" ? offset : 0;
    const reportSearchWhere = reportWhere(q);
    const [marketReports, dailyReports, weeklyReports, monthlyReports] = await Promise.all([
      prisma.marketReport.findMany({ where: reportSearchWhere, orderBy: { publishedAt: "desc" }, skip: reportSkip, take: reportTake }),
      prisma.dailyReport.findMany({ where: reportSearchWhere, orderBy: { publishedAt: "desc" }, skip: reportSkip, take: reportTake }),
      prisma.weeklyReport.findMany({ where: reportSearchWhere, orderBy: { publishedAt: "desc" }, skip: reportSkip, take: reportTake }),
      prisma.monthlyReport.findMany({ where: reportSearchWhere, orderBy: { publishedAt: "desc" }, skip: reportSkip, take: reportTake }),
    ]);
    results.push(...[...marketReports, ...dailyReports, ...weeklyReports, ...monthlyReports].map((item) => simpleResult("reports", item)));
  }

  const requestHeaders = await headers();
  await logSearch({ filters, resultCount: results.length, userId: requestHeaders.get("x-user-id") ?? undefined, ip: requestHeaders.get("x-forwarded-for"), userAgent: requestHeaders.get("user-agent") });

  return NextResponse.json({ items: results.slice(0, filters.limit), page: filters.page, limit: filters.limit, total: results.length, hasNextPage: filters.type !== "all" && results.length === filters.limit });
}
