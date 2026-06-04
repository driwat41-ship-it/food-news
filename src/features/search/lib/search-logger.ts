import { createHash } from "node:crypto";
import { Language, type Language as PrismaLanguage, type Prisma } from "@prisma/client";
import { prisma } from "../../../services/database/prisma";
import type { SearchFilters } from "../types";

export function hashIp(ip?: string | null) {
  if (!ip) return undefined;
  return createHash("sha256").update(ip).digest("hex");
}

function filtersToJsonObject(filters: SearchFilters): Prisma.InputJsonObject {
  const jsonFilters: Record<string, Prisma.InputJsonValue> = {
    q: filters.q,
    type: filters.type,
    page: filters.page,
    limit: filters.limit,
    sort: filters.sort,
  };

  if (filters.category !== undefined) jsonFilters.category = filters.category;
  if (filters.country !== undefined) jsonFilters.country = filters.country;
  if (filters.brand !== undefined) jsonFilters.brand = filters.brand;
  if (filters.language !== undefined) jsonFilters.language = filters.language;
  if (filters.dateFrom !== undefined) jsonFilters.dateFrom = filters.dateFrom;
  if (filters.dateTo !== undefined) jsonFilters.dateTo = filters.dateTo;

  return jsonFilters;
}

function isLanguage(value: string | undefined): value is PrismaLanguage {
  return Object.values(Language).some((language) => language === value);
}

function toLanguage(value: string | undefined): PrismaLanguage | undefined {
  return isLanguage(value) ? value : undefined;
}

export async function logSearch(input: { filters: SearchFilters; resultCount: number; userId?: string; ip?: string | null; userAgent?: string | null }) {
  await prisma.searchQuery.create({
    data: {
      userId: input.userId,
      query: input.filters.q,
      filters: filtersToJsonObject(input.filters),
      language: toLanguage(input.filters.language),
      resultCount: input.resultCount,
      ipHash: hashIp(input.ip),
      userAgent: input.userAgent ?? undefined,
    },
  });
}
