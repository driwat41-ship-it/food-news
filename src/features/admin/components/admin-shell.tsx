import Link from "next/link";
import type { ReactNode } from "react";

const links = [
  ["Dashboard", "/admin"], ["News", "/admin/news"], ["Review", "/admin/review"], ["Brands", "/admin/brands"], ["Countries", "/admin/countries"], ["Categories", "/admin/categories"], ["Sources", "/admin/sources"], ["Jobs", "/admin/jobs"], ["Logs", "/admin/logs"], ["Settings", "/admin/settings"],
];

export function AdminShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white"><aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:block"><Link href="/admin" className="text-xl font-black">GFBI Admin</Link><nav className="mt-8 grid gap-1">{links.map(([label, href]) => <Link key={href} href={href} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-slate-800">{label}</Link>)}</nav></aside><div className="lg:pl-72"><header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90"><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-wide text-slate-500">Admin Console</p><h1 className="font-bold">Review & Operations</h1></div><Link href="/" className="text-sm font-semibold text-emerald-700">Public site</Link></div><nav className="mt-3 flex gap-3 overflow-x-auto lg:hidden">{links.map(([label, href]) => <Link key={href} href={href} className="text-sm text-slate-500">{label}</Link>)}</nav></header><main className="p-4 lg:p-8">{children}</main></div></div>;
}

export function Breadcrumbs({ items }: { items: string[] }) { return <div className="mb-4 text-sm text-slate-500">{items.join(" / ")}</div>; }
