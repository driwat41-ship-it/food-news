import Link from "next/link";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";

export function EntityCard({ href, title, description, stat, badge }: { href: string; title: string; description?: string | null; stat?: string; badge?: string | null }) {
  return <Card><CardHeader><div className="flex items-start justify-between gap-3"><Link href={href} className="text-lg font-bold text-slate-950 hover:text-emerald-700 dark:text-white dark:hover:text-emerald-300">{title}</Link>{badge ? <Badge variant="outline">{badge}</Badge> : null}</div></CardHeader><CardContent><p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{description ?? "Market intelligence profile with latest news, reports, and trend signals."}</p>{stat ? <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">{stat}</p> : null}</CardContent></Card>;
}
