import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, CardContent } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { NewsCard } from "../../../../features/public/components/news-card";
import { Section } from "../../../../features/public/components/section";
import { getBrandBySlug } from "../../../../features/public/data/intelligence";
import { createPageMetadata } from "../../../../features/public/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const data = await getBrandBySlug(slug); return createPageMetadata({ title: data?.brand.name ?? "Brand", description: data?.brand.description ?? "Brand intelligence profile", path: `/brands/${slug}`, noIndex: !data }); }

export default async function BrandDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getBrandBySlug(slug);
  if (!data) notFound();
  return <div><div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-950"><Badge variant="accent">{data.brand.industryType}</Badge><h1 className="mt-4 text-4xl font-black">{data.brand.name}</h1><p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">{data.brand.description ?? "Brand profile pending analyst enrichment."}</p><div className="mt-6 grid gap-4 md:grid-cols-4"><Card><CardContent><b>{data.brand._count.mentions}</b><p>mentions</p></CardContent></Card><Card><CardContent><b>{data.brand._count.productLaunches}</b><p>launches</p></CardContent></Card><Card><CardContent><b>{data.brand._count.fundingEvents}</b><p>funding events</p></CardContent></Card><Card><CardContent><b>{data.brand._count.franchiseOpportunities}</b><p>franchise opportunities</p></CardContent></Card></div></div><Section title="Trend Chart"><div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-300 text-slate-500 dark:border-slate-700">Trend chart placeholder</div></Section><Section title="Latest Brand News"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{data.latestNews.map((news) => <NewsCard key={news.id} news={news} />)}</div></Section><Section title="Expansion News"><div className="grid gap-4 md:grid-cols-2">{data.storeExpansions.map((item: any) => <Card key={item.id}><CardContent><h3 className="font-bold">{item.title}</h3><p className="text-sm text-slate-500">{item.city ?? item.expansionType}</p></CardContent></Card>)}</div></Section><Section title="Product Launches"><div className="grid gap-4 md:grid-cols-2">{data.productLaunches.map((item: any) => <Card key={item.id}><CardContent><h3 className="font-bold">{item.title}</h3><p className="text-sm text-slate-500">{item.description}</p></CardContent></Card>)}</div></Section><Section title="Funding & Franchise"><div className="grid gap-4 md:grid-cols-2">{[...data.fundingEvents, ...data.franchiseOpportunities].map((item: any) => <Card key={item.id}><CardContent><h3 className="font-bold">{item.title}</h3><p className="text-sm text-slate-500">{item.summary ?? item.description ?? "Pending review"}</p></CardContent></Card>)}</div></Section></div>;
}
