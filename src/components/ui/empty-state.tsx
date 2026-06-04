import type { ReactNode } from "react";

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700"><h2 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h2>{description ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}{action ? <div className="mt-5">{action}</div> : null}</div>;
}
