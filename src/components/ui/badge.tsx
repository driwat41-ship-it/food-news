import type { ReactNode } from "react";

export function Badge({ children, variant = "default" }: { children: ReactNode; variant?: "default" | "outline" | "accent" }) {
  const variants = {
    default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    outline: "border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300",
    accent: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${variants[variant]}`}>{children}</span>;
}
