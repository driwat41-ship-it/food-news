import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "../../../../components/ui/badge";
import { NewsCard } from "../../../../features/public/components/news-card";
import { Section } from "../../../../features/public/components/section";
import { getReportBySlug } from "../../../../features/public/data/intelligence";
import { createPageMetadata } from "../../../../features/public/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const data = await getReportBySlug(slug); return createPageMetadata({ title: (data?.report as any)?.title ?? "Report", description: (data?.report as any)?.summary ?? "Intelligence report", path: `/reports/${slug}`, noIndex: !data }); }
export default async function ReportDetailPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const data = await getReportBySlug(slug); if (!data) notFound(); const report: any = data.report; return <article className="mx-auto max-w-4xl"><Badge variant="accent">Report</Badge><h1 className="mt-4 text-4xl font-black">{report.title}</h1><p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{report.summary}</p><div className="prose prose-slate mt-8 max-w-none dark:prose-invert"><p>{report.body ?? "Report body pending publication."}</p></div><Section title="Source Articles"><div className="grid gap-4 md:grid-cols-2">{data.relatedNews.map((news) => <NewsCard key={news.id} news={news} />)}</div></Section></article>; }
