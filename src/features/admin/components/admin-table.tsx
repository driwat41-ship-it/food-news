import type { ReactNode } from "react";

export function AdminTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800"><thead className="bg-slate-50 dark:bg-slate-800/60"><tr>{headers.map((header) => <th key={header} className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{children}</tbody></table></div>;
}

export function Td({ children }: { children: ReactNode }) { return <td className="px-4 py-3 align-top text-slate-700 dark:text-slate-200">{children}</td>; }
