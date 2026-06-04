import { aiConfig } from "../config/ai.config";
import type { CleanArticleContent } from "../types";

export class ContentCleanerService {
  clean(input: {
    newsId: string;
    title: string;
    body?: string | null;
    excerpt?: string | null;
    sourceUrl?: string | null;
    publishedAt?: Date | null;
    sourceName?: string | null;
  }): CleanArticleContent {
    const body = this.normalize([input.excerpt, input.body].filter(Boolean).join("\n\n"));

    return {
      newsId: input.newsId,
      title: this.normalize(input.title).slice(0, 500),
      body: body.slice(0, aiConfig.maxContentChars),
      sourceUrl: input.sourceUrl,
      publishedAt: input.publishedAt,
      sourceName: input.sourceName,
    };
  }

  private normalize(value: string): string {
    return value
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
  }
}

export const contentCleanerService = new ContentCleanerService();
