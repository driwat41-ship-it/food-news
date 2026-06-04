import type { CleanArticleContent } from "../types";

export function buildArticleAnalysisPrompt(article: CleanArticleContent): string {
  return `You are an enterprise food and beverage intelligence analyst.

Analyze the article and return STRICT JSON only. Do not include markdown.

Hard rules:
- Do not invent brands, countries, products, funding amounts, investors, franchise fees, or dates.
- Extract only entities explicitly present in the article text.
- If evidence is weak, omit the entity or use a low confidence score.
- Funding amount must be null/omitted unless an exact amount appears in the article.
- Franchise investment fields must be null/omitted unless explicitly stated.
- Product launches must refer to actual new products, menu items, SKUs, or launches in the article.
- Categories must map to one of: Tea, Bubble Tea, Coffee, Restaurant Chains, QSR, FMCG, Beverage, Food Service, Retail, Other.
- industryType must be one of: TEA, BUBBLE_TEA, COFFEE, RESTAURANT_CHAINS, QSR, FMCG, BEVERAGE, FOOD_SERVICE, RETAIL, OTHER.
- detectedLanguage must be one of: EN, ZH, JA, KO, ES, FR, DE, IT, PT, NL, ID, MS, TH, VI, HI, AR, TR, RU, OTHER.
- Chinese output must be Simplified Chinese.

Return exactly this JSON shape:
{
  "titleEn": "string",
  "titleZh": "string",
  "summaryEn": "string, 2-4 sentences",
  "summaryZh": "string, 2-4 sentences in Simplified Chinese",
  "keyTakeawaysEn": ["3-6 concise bullets"],
  "keyTakeawaysZh": ["3-6 concise Simplified Chinese bullets"],
  "detectedLanguage": "EN",
  "industryType": "OTHER",
  "category": "Other",
  "tags": ["lowercase concise tags"],
  "brandMentions": [{"name":"string","confidence":0.0,"evidence":"short quote or paraphrase"}],
  "countryMentions": [{"name":"string","confidence":0.0,"evidence":"short quote or paraphrase"}],
  "productLaunches": [{"title":"string","description":"string","brandName":"string","countryName":"string","launchDate":"YYYY-MM-DD","confidence":0.0}],
  "franchiseOpportunities": [{"title":"string","description":"string","brandName":"string","countryName":"string","investmentMin":null,"investmentMax":null,"currency":"USD","confidence":0.0}],
  "fundingEvents": [{"title":"string","eventType":"funding|acquisition|ipo|investment|merger|debt|other","brandName":"string","countryName":"string","amount":null,"currency":"USD","announcedAt":"YYYY-MM-DD","investors":["string"],"confidence":0.0}],
  "confidenceScore": 0.0
}

Article metadata:
Title: ${article.title}
Source: ${article.sourceName ?? "Unknown"}
URL: ${article.sourceUrl ?? "Unknown"}
Published at: ${article.publishedAt?.toISOString() ?? "Unknown"}

Article content:
${article.body}`;
}
