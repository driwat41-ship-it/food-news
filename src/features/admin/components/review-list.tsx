import Link from "next/link";
import { AdminTable, Td } from "./admin-table";
import { ConfirmButton } from "./admin-actions";

export function ReviewList({ items, approve, reject }: { items: any[]; approve: (id: string) => Promise<void>; reject: (id: string) => Promise<void> }) {
  return <AdminTable headers={["Item", "Confidence/Status", "Source", "Actions"]}>{items.map((item) => <tr key={item.id}><Td><b>{item.title ?? item.name ?? item.language}</b><p className="text-xs text-slate-500">{item.summary ?? item.description ?? item.aiSummary ?? item.excerpt}</p></Td><Td>{item.confidence ?? item.qualityScore ?? item.aiReviewStatus ?? item.reviewStatus}</Td><Td>{item.news ? <Link href={`/admin/news/${item.news.id}`} className="text-emerald-700">Source article</Link> : "-"}</Td><Td><div className="flex gap-2"><ConfirmButton action={async () => { "use server"; await approve(item.id); }} className="bg-emerald-100 text-emerald-800">Approve</ConfirmButton><ConfirmButton action={async () => { "use server"; await reject(item.id); }} className="bg-red-100 text-red-800">Reject</ConfirmButton></div></Td></tr>)}</AdminTable>;
}
