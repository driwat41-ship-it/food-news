import Link from "next/link";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { timeAgo } from "../lib/format";
import type { PublicNewsCard } from "../types";

export function NewsCard({ news, priority = false }: { news: PublicNewsCard; priority?: boolean }) {
  return <Card className={priority ? "border-emerald-300 dark:border-emerald-800" : ""}><CardHeader><div className="mb-3 flex flex-wrap gap-2">{news.category ? <Badge variant="accent">{news.category}</Badge> : null}{news.country ? <Badge variant="outline">{news.country}</Badge> : null}<Badge>{timeAgo(news.publishedAt)}</Badge></div><Link href={`/news/${news.slug}`} className="group"><h3 className="text-lg font-bold leading-snug text-slate-950 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-300">{news.title}</h3>{news.translatedTitle ? <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{news.translatedTitle}</p> : null}</Link></CardHeader><CardContent><p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{news.summary ?? "Summary pending AI review."}</p><div className="mt-4 flex flex-wrap gap-2">{news.brands.slice(0, 3).map((brand) => <Badge key={brand} variant="outline">{brand}</Badge>)}{news.tags.slice(0, 4).map((tag) => <Badge key={tag}>{tag}</Badge>)}</div><div className="mt-4 text-xs text-slate-500 dark:text-slate-400">{news.source ?? "Unknown source"}</div></CardContent></Card>;
}
