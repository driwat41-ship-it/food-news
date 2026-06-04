import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <article className={`rounded-2xl border border-slate-200 bg-white/90 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-950/80 ${className}`}>{children}</article>;
}

export function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`p-5 pb-3 ${className}`}>{children}</div>;
}

export function CardContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`p-5 pt-2 ${className}`}>{children}</div>;
}
