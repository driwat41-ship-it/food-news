import type { AIArticleAnalysisResult } from "../types";

export class SummaryService {
  normalize(result: AIArticleAnalysisResult): Pick<AIArticleAnalysisResult, "summaryEn" | "summaryZh" | "keyTakeawaysEn" | "keyTakeawaysZh"> {
    return {
      summaryEn: this.requiredText(result.summaryEn, "summaryEn"),
      summaryZh: this.requiredText(result.summaryZh, "summaryZh"),
      keyTakeawaysEn: this.normalizeTakeaways(result.keyTakeawaysEn),
      keyTakeawaysZh: this.normalizeTakeaways(result.keyTakeawaysZh),
    };
  }

  private requiredText(value: string, field: string): string {
    const normalized = String(value ?? "").trim();
    if (!normalized) throw new Error(`AI response missing ${field}`);
    return normalized;
  }

  private normalizeTakeaways(value: string[]): string[] {
    return (Array.isArray(value) ? value : []).map((item) => String(item).trim()).filter(Boolean).slice(0, 6);
  }
}

export const summaryService = new SummaryService();
