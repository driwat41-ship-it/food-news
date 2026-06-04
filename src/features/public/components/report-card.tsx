import Link from "next/link";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { formatDate } from "../lib/format";
import type { PublicReportCard } from "../types";

export function ReportCard({ report }: { report: PublicReportCard }) {
  return <Card><CardHeader><div className="mb-3 flex gap-2"><Badge variant="accent">{report.reportType}</Badge><Badge>{formatDate(report.publishedAt)}</Badge></div><Link href={`/reports/${report.slug}`} className="text-lg font-bold text-slate-950 hover:text-emerald-700 dark:text-white dark:hover:text-emerald-300">{report.title}</Link></CardHeader><CardContent><p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{report.summary ?? "Executive intelligence report generated from market signals and analyst workflows."}</p></CardContent></Card>;
}
