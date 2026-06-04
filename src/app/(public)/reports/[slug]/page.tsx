import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "../../../../components/ui/badge";
import { NewsCard } from "../../../../features/public/components/news-card";
import { Section } from "../../../../features/public/components/section";
import { getReportBySlug } from "../../../../features/public/data/intelligence";
import { createPageMetadata } from "../../../../features/public/lib/seo";
import type { PublicNewsCard } from "../../../../features/public/types";

type ReportDetail = {
  title: string;
  summary: string | null;
  body: string | null;
};

type ReportData = {
  report: ReportDetail;
  relatedNews: PublicNewsCard[];
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const data = await getReportBySlug(slug) as unknown as ReportData | null; return createPageMetadata({ title: data?.report.title ?? "Report", description: data?.report.summary ?? "Intelligence report", path: `/reports/${slug}`, noIndex: !data }); }
export default async function ReportDetailPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const data = await getReportBySlug(slug) as unknown as ReportData | null; if (!data) notFound(); const report = data.report; return <article className="mx-auto max-w-4xl"><Badge variant="accent">Report</Badge><h1 className="mt-4 text-4xl font-black">{report.title}</h1><p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{report.summary}</p><div className="prose prose-slate mt-8 max-w-none dark:prose-invert"><p>{report.body ?? "Report body pending publication."}</p></div><Section title="Source Articles"><div className="grid gap-4 md:grid-cols-2">{data.relatedNews.map((news: PublicNewsCard) => <NewsCard key={news.id} news={news} />)}</div></Section></article>; }
