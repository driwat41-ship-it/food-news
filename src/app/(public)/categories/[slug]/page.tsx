import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, CardContent } from "../../../../components/ui/card";
import { NewsCard } from "../../../../features/public/components/news-card";
import { Section } from "../../../../features/public/components/section";
import { getCategoryBySlug } from "../../../../features/public/data/intelligence";
import { createPageMetadata } from "../../../../features/public/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const data = await getCategoryBySlug(slug); return createPageMetadata({ title: data?.category.name ?? "Category", description: `Category intelligence for ${data?.category.name ?? slug}.`, path: `/categories/${slug}`, noIndex: !data }); }
export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const data = await getCategoryBySlug(slug); if (!data) notFound(); return <div><h1 className="text-4xl font-black">{data.category.name}</h1><p className="mt-2 text-slate-500">{data.category.description ?? `${data.category._count.news} tracked articles`}</p><Section title="Category News"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{data.news.map((news) => <NewsCard key={news.id} news={news} />)}</div></Section><Section title="Category Trends"><div className="grid gap-4 md:grid-cols-2">{data.trends.map((trend: any) => <Card key={trend.id}><CardContent><h3 className="font-bold">{trend.name}</h3><p className="text-sm text-slate-500">{trend.description ?? "Trend signal detected"}</p></CardContent></Card>)}</div></Section></div>; }
