import type { ReactNode } from "react";

export function Section({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return <section className="py-8"><div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{title}</h2>{description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}</div>{action}</div>{children}</section>;
}
