import { ReportCard } from "../../../features/public/components/report-card";
import { getFeaturedReports } from "../../../features/public/data/intelligence";
import { createPageMetadata } from "../../../features/public/lib/seo";

export const metadata = createPageMetadata({ title: "Reports", description: "Daily, weekly, monthly, and market intelligence reports.", path: "/reports" });
export default async function ReportsPage() { const reports = await getFeaturedReports(60); return <div><h1 className="text-4xl font-black">Intelligence Reports</h1><p className="mt-2 text-slate-500">Daily, weekly, monthly, and market reports generated from news, AI signals, and analyst workflows.</p><div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{reports.map((report) => <ReportCard key={`${report.reportType}-${report.id}`} report={report} />)}</div></div>; }
