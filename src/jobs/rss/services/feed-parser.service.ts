import type { FetchFeedResult, ParsedFeedItem } from "../types";
import { getBlocks, getTagAttribute, getTagValue, stripHtml } from "../utils/xml";

export class FeedParserService {
  parseFeed(result: FetchFeedResult): ParsedFeedItem[] {
    const rssItems = getBlocks(result.xml, "item");
    const atomEntries = getBlocks(result.xml, "entry");
    const blocks = rssItems.length > 0 ? rssItems : atomEntries;

    return blocks
      .map((block) => this.parseItem(block, result, rssItems.length > 0 ? "rss" : "atom"))
      .filter((item): item is ParsedFeedItem => Boolean(item?.title && item?.url));
  }

  normalizeItem(item: ParsedFeedItem): ParsedFeedItem {
    return {
      ...item,
      title: stripHtml(item.title),
      description: item.description ? stripHtml(item.description) : undefined,
      content: item.content ? this.normalizeContent(item.content) : item.description,
      author: item.author ? stripHtml(item.author) : undefined,
      url: item.url.trim(),
      image: item.image?.trim(),
    };
  }

  private parseItem(block: string, result: FetchFeedResult, format: "rss" | "atom"): ParsedFeedItem | null {
    const title = getTagValue(block, "title");
    const url = this.extractUrl(block, format);

    if (!title || !url) return null;

    const description = getTagValue(block, "description") ?? getTagValue(block, "summary");
    const content =
      getTagValue(block, "content:encoded") ??
      getTagValue(block, "content") ??
      getTagValue(block, "description") ??
      getTagValue(block, "summary");
    const author =
      getTagValue(block, "dc:creator") ??
      getTagValue(block, "author") ??
      getTagValue(block, "name");
    const rawDate =
      getTagValue(block, "pubDate") ??
      getTagValue(block, "published") ??
      getTagValue(block, "updated") ??
      getTagValue(block, "dc:date");

    return {
      title,
      description,
      content,
      author,
      publishedAt: rawDate ? this.parseDate(rawDate) : undefined,
      sourceId: result.source.id,
      sourceName: result.source.name,
      url,
      image: this.extractImage(block),
      language: result.source.language,
      categoryId: result.source.categoryId,
      countryId: result.source.countryId,
      industryType: result.source.industryType,
    };
  }

  private extractUrl(block: string, format: "rss" | "atom"): string | undefined {
    if (format === "atom") {
      return getTagAttribute(block, "link", "href") ?? getTagValue(block, "link");
    }

    return getTagValue(block, "link") ?? getTagValue(block, "guid") ?? getTagAttribute(block, "link", "href");
  }

  private extractImage(block: string): string | undefined {
    return (
      getTagAttribute(block, "media:content", "url") ??
      getTagAttribute(block, "media:thumbnail", "url") ??
      getTagValue(block, "enclosure") ??
      this.extractFirstImageFromHtml(block)
    );
  }

  private extractFirstImageFromHtml(value: string): string | undefined {
    return value.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
  }

  private normalizeContent(value: string): string {
    return stripHtml(value).slice(0, 100_000);
  }

  private parseDate(value: string): Date | undefined {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }
}

export const feedParserService = new FeedParserService();
