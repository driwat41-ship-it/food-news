import type { ReactNode } from "react";

export function StatCard({ label, value, tone = "default" }: { label: string; value: number | string; tone?: "default" | "danger" | "success" }) {
  const color = tone === "danger" ? "text-red-600" : tone === "success" ? "text-emerald-600" : "text-slate-950 dark:text-white";
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-sm text-slate-500">{label}</p><p className={`mt-2 text-3xl font-black ${color}`}>{value}</p></div>;
}

export function AdminPanel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-bold">{title}</h2>{action}</div>{children}</section>;
}
