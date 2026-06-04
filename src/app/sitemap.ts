import type { MetadataRoute } from "next";
import { prisma } from "../services/database/prisma";
import { absoluteUrl } from "../features/public/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["/", "/news", "/brands", "/countries", "/categories", "/reports", "/search"].map((path) => ({ url: absoluteUrl(path), changeFrequency: "hourly" as const, priority: path === "/" ? 1 : 0.8 }));
  const [news, brands, countries, categories, marketReports, dailyReports, weeklyReports, monthlyReports] = await Promise.all([
    prisma.news.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true, publishedAt: true }, orderBy: { publishedAt: "desc" }, take: 45_000 }),
    prisma.brand.findMany({ select: { slug: true, updatedAt: true }, orderBy: { updatedAt: "desc" }, take: 10_000 }),
    prisma.country.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true }, take: 500 }),
    prisma.category.findMany({ select: { slug: true, updatedAt: true }, take: 2_000 }),
    prisma.marketReport.findMany({ where: { publishedAt: { not: null } }, select: { slug: true, updatedAt: true }, take: 10_000 }),
    prisma.dailyReport.findMany({ where: { publishedAt: { not: null } }, select: { slug: true, updatedAt: true }, take: 10_000 }),
    prisma.weeklyReport.findMany({ where: { publishedAt: { not: null } }, select: { slug: true, updatedAt: true }, take: 10_000 }),
    prisma.monthlyReport.findMany({ where: { publishedAt: { not: null } }, select: { slug: true, updatedAt: true }, take: 10_000 }),
  ]);
  return [
    ...staticRoutes,
    ...news.map((item) => ({ url: absoluteUrl(`/news/${item.slug}`), lastModified: item.updatedAt ?? item.publishedAt ?? undefined, changeFrequency: "daily" as const, priority: 0.7 })),
    ...brands.map((item) => ({ url: absoluteUrl(`/brands/${item.slug}`), lastModified: item.updatedAt, changeFrequency: "daily" as const, priority: 0.7 })),
    ...countries.map((item) => ({ url: absoluteUrl(`/countries/${item.slug}`), lastModified: item.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...categories.map((item) => ({ url: absoluteUrl(`/categories/${item.slug}`), lastModified: item.updatedAt, changeFrequency: "daily" as const, priority: 0.6 })),
    ...[...marketReports, ...dailyReports, ...weeklyReports, ...monthlyReports].map((item) => ({ url: absoluteUrl(`/reports/${item.slug}`), lastModified: item.updatedAt, changeFrequency: "weekly" as const, priority: 0.65 })),
  ];
}
