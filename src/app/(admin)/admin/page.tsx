import Link from "next/link";
import { AdminPanel, StatCard } from "../../../features/admin/components/admin-cards";
import { AdminTable, Td } from "../../../features/admin/components/admin-table";
import { getAdminDashboardData } from "../../../features/admin/data/admin-loaders";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();
  return <div className="grid gap-6"><div><h1 className="text-3xl font-black">Dashboard Overview</h1><p className="text-slate-500">Operational health, review load, ingestion status, and recent content.</p></div><div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6"><StatCard label="Total articles" value={data.totalArticles} /><StatCard label="Articles today" value={data.articlesToday} /><StatCard label="Pending reviews" value={data.pendingReviews} /><StatCard label="Failed jobs" value={data.failedJobs} tone="danger" /><StatCard label="Active RSS sources" value={data.activeSources} tone="success" /><StatCard label="AI processed" value={data.aiProcessedArticles} /></div><div className="grid gap-6 xl:grid-cols-2"><AdminPanel title="Latest Errors"><AdminTable headers={["Job", "Source", "Error"]}>{data.latestErrors.map((item) => <tr key={item.id}><Td>{item.job?.name ?? "Unknown"}</Td><Td>{item.source?.name ?? "-"}</Td><Td>{item.errorMessage ?? "Failed"}</Td></tr>)}</AdminTable></AdminPanel><AdminPanel title="Recent Articles"><AdminTable headers={["Title", "Status", "Source"]}>{data.recentArticles.map((item) => <tr key={item.id}><Td><Link href={`/admin/news/${item.id}`} className="font-semibold text-emerald-700">{item.title}</Link></Td><Td>{item.status}</Td><Td>{item.source?.name ?? "-"}</Td></tr>)}</AdminTable></AdminPanel></div></div>;
}
