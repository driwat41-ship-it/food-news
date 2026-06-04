import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "../../../../services/database/prisma";

const getSuggestions = unstable_cache(async (q: string) => {
  const [brands, countries, categories, popular] = await Promise.all([
    prisma.brand.findMany({ where: q ? { name: { contains: q, mode: "insensitive" } } : {}, select: { name: true, slug: true }, orderBy: { updatedAt: "desc" }, take: 8 }),
    prisma.country.findMany({ where: q ? { name: { contains: q, mode: "insensitive" } } : {}, select: { name: true, slug: true }, orderBy: { name: "asc" }, take: 8 }),
    prisma.category.findMany({ where: q ? { name: { contains: q, mode: "insensitive" } } : {}, select: { name: true, slug: true }, orderBy: { name: "asc" }, take: 8 }),
    prisma.searchQuery.findMany({ where: { query: { not: "" } }, select: { query: true, resultCount: true }, orderBy: [{ resultCount: "desc" }, { createdAt: "desc" }], take: 20 }),
  ]);
  return { brands, countries, categories, trendingKeywords: popular.map((item) => item.query), recentPopularSearches: popular };
}, ["search-suggestions"], { revalidate: 300 });

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  return NextResponse.json(await getSuggestions(q));
}
