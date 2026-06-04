import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "../../../../components/ui/badge";
import { JsonLd } from "../../../../components/seo/json-ld";
import { ButtonLink } from "../../../../components/ui/button";
import { NewsCard } from "../../../../features/public/components/news-card";
import { Section } from "../../../../features/public/components/section";
import { getNewsBySlug } from "../../../../features/public/data/intelligence";
import { formatDate } from "../../../../features/public/lib/format";
import { breadcrumbJsonLd, createPageMetadata, newsArticleJsonLd } from "../../../../features/public/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getNewsBySlug(slug);
  if (!data) return createPageMetadata({ title: "News not found", description: "News article not found", noIndex: true });
  return createPageMetadata({ title: data.card.translatedTitle ?? data.card.title, description: data.card.summary ?? data.card.title, path: `/news/${slug}` });
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getNewsBySlug(slug);
  if (!data) notFound();
  const { news, card, related } = data;
  const en = news.translations.find((translation) => translation.language === "EN");
  const zh = news.translations.find((translation) => translation.language === "ZH");
  const articleUrl = news.canonicalUrl ?? news.originalUrl;
  return <article className="mx-auto max-w-4xl"><JsonLd data={newsArticleJsonLd({ title: news.title, summary: card.summary, slug: news.slug, publishedAt: news.publishedAt, updatedAt: news.updatedAt, image: news.imageUrl, source: card.source })} /><JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "News", path: "/news" }, { name: news.title, path: `/news/${news.slug}` }])} /><div className="mb-5 flex flex-wrap gap-2">{card.category ? <Badge variant="accent">{card.category}</Badge> : null}{card.country ? <Badge variant="outline">{card.country}</Badge> : null}<Badge>{formatDate(card.publishedAt)}</Badge></div><h1 className="text-4xl font-black leading-tight md:text-5xl">{news.title}</h1>{card.translatedTitle ? <p className="mt-3 text-2xl font-semibold text-slate-500 dark:text-slate-300">{card.translatedTitle}</p> : null}<p className="mt-6 rounded-2xl bg-slate-100 p-5 text-lg leading-8 dark:bg-slate-900">{card.summary ?? "Summary pending."}</p><Section title="Key Takeaways"><div className="grid gap-3 md:grid-cols-2"><ul className="list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">{(en?.keyTakeaways ?? []).map((item: string) => <li key={item}>{item}</li>)}</ul><ul className="list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">{(zh?.keyTakeaways ?? []).map((item: string) => <li key={item}>{item}</li>)}</ul></div></Section><Section title="Related Intelligence"><div className="flex flex-wrap gap-2">{card.brands.map((brand) => <Badge key={brand} variant="outline">{brand}</Badge>)}{card.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div><div className="mt-6 text-sm text-slate-500">Source: {card.source ?? "Unknown"}</div>{articleUrl ? <ButtonLink className="mt-5" href={articleUrl} target="_blank">Open original article</ButtonLink> : null}</Section><Section title="Related News"><div className="grid gap-4 md:grid-cols-2">{related.map((item) => <NewsCard key={item.id} news={item} />)}</div></Section></article>;
}
