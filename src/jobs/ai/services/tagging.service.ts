import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "../../../services/database/prisma";

export class TaggingService {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async saveTags(newsId: string, tags: string[], categoryId?: string | null, tx: Prisma.TransactionClient = this.prisma): Promise<void> {
    const uniqueTags = [...new Set((Array.isArray(tags) ? tags : []).map((tag) => this.normalizeTag(tag)).filter(Boolean))].slice(0, 20);

    for (const tag of uniqueTags) {
      const savedTag = await tx.tag.upsert({
        where: { slug: this.slugify(tag) },
        update: { name: tag, categoryId: categoryId ?? undefined },
        create: { name: tag, slug: this.slugify(tag), categoryId: categoryId ?? undefined },
        select: { id: true },
      });

      await tx.newsTag.upsert({
        where: { newsId_tagId: { newsId, tagId: savedTag.id } },
        update: {},
        create: { newsId, tagId: savedTag.id },
      });
    }
  }

  private normalizeTag(tag: string): string {
    return String(tag).trim().toLowerCase().slice(0, 80);
  }

  private slugify(tag: string): string {
    return tag.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
}

export const taggingService = new TaggingService();
