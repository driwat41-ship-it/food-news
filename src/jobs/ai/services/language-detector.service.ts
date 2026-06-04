import type { Language } from "@prisma/client";

export class LanguageDetectorService {
  detect(text: string): Language {
    const sample = text.slice(0, 4_000);

    if (/[\u4e00-\u9fff]/.test(sample)) return "ZH";
    if (/[\u3040-\u30ff]/.test(sample)) return "JA";
    if (/[\uac00-\ud7af]/.test(sample)) return "KO";
    if (/[\u0e00-\u0e7f]/.test(sample)) return "TH";
    if (/[\u0600-\u06ff]/.test(sample)) return "AR";
    if (/[А-Яа-яЁё]/.test(sample)) return "RU";

    return "EN";
  }
}

export const languageDetectorService = new LanguageDetectorService();
