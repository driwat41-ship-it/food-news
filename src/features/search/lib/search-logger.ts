import { createHash } from "node:crypto";
import { prisma } from "../../../services/database/prisma";
import type { SearchFilters } from "../types";

export function hashIp(ip?: string | null) {
  if (!ip) return undefined;
  return createHash("sha256").update(ip).digest("hex");
}

export async function logSearch(input: { filters: SearchFilters; resultCount: number; userId?: string; ip?: string | null; userAgent?: string | null }) {
  await prisma.searchQuery.create({
    data: {
      userId: input.userId,
      query: input.filters.q,
      filters: input.filters,
      language: input.filters.language as any,
      resultCount: input.resultCount,
      ipHash: hashIp(input.ip),
      userAgent: input.userAgent ?? undefined,
    },
  });
}
