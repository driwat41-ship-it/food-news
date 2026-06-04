import type { Metadata } from "next";

export const siteName = "Global Food & Beverage Intelligence";
export const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://global-food-intelligence.example";

export function absoluteUrl(path = "") {
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function createPageMetadata(input: {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
  image?: string;
}): Metadata {
  const url = absoluteUrl(input.path ?? "");
  return {
    title: `${input.title} | ${siteName}`,
    description: input.description,
    alternates: {
      canonical: url,
      languages: { en: url, zh: `${url}${url.includes("?") ? "&" : "?"}lang=zh` },
    },
    robots: input.noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName,
      images: input.image ? [{ url: input.image }] : [{ url: absoluteUrl("/og/default.png") }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: input.image ? [input.image] : [absoluteUrl("/og/default.png")],
    },
  };
}

export const metadataHelpers = {
  homepage: () => createPageMetadata({ title: "Real-time Food & Beverage Intelligence", description: "Live multilingual food and beverage market intelligence across tea, bubble tea, coffee, QSR, restaurant chains, and FMCG.", path: "/" }),
  news: (news: { slug: string; title: string; summary?: string | null; image?: string | null }) => createPageMetadata({ title: news.title, description: news.summary ?? news.title, path: `/news/${news.slug}`, image: news.image ?? undefined }),
  brand: (brand: { slug: string; name: string; description?: string | null; logo?: string | null }) => createPageMetadata({ title: brand.name, description: brand.description ?? `${brand.name} brand intelligence, news, funding, expansion, and market signals.`, path: `/brands/${brand.slug}`, image: brand.logo ?? undefined }),
  country: (country: { slug: string; name: string; region?: string | null }) => createPageMetadata({ title: `${country.name} Market Intelligence`, description: `Food and beverage intelligence for ${country.name}${country.region ? ` in ${country.region}` : ""}.`, path: `/countries/${country.slug}` }),
  category: (category: { slug: string; name: string; description?: string | null }) => createPageMetadata({ title: `${category.name} Intelligence`, description: category.description ?? `Latest ${category.name} news, brands, countries, reports, and trends.`, path: `/categories/${category.slug}` }),
  report: (report: { slug: string; title: string; summary?: string | null }) => createPageMetadata({ title: report.title, description: report.summary ?? report.title, path: `/reports/${report.slug}` }),
};

export function organizationJsonLd() {
  return { "@context": "https://schema.org", "@type": "Organization", name: siteName, url: baseUrl };
}

export function websiteJsonLd() {
  return { "@context": "https://schema.org", "@type": "WebSite", name: siteName, url: baseUrl, potentialAction: { "@type": "SearchAction", target: `${baseUrl}/search?q={search_term_string}`, "query-input": "required name=search_term_string" } };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: absoluteUrl(item.path) })) };
}

export function newsArticleJsonLd(news: { title: string; summary?: string | null; slug: string; publishedAt?: Date | string | null; updatedAt?: Date | string | null; image?: string | null; source?: string | null }) {
  return { "@context": "https://schema.org", "@type": "NewsArticle", headline: news.title, description: news.summary, url: absoluteUrl(`/news/${news.slug}`), datePublished: news.publishedAt ? new Date(news.publishedAt).toISOString() : undefined, dateModified: news.updatedAt ? new Date(news.updatedAt).toISOString() : undefined, image: news.image ? [news.image] : undefined, publisher: { "@type": "Organization", name: news.source ?? siteName } };
}

export function collectionPageJsonLd(input: { title: string; path: string; description: string }) {
  return { "@context": "https://schema.org", "@type": "CollectionPage", name: input.title, description: input.description, url: absoluteUrl(input.path) };
}
