import { EmptyState } from "../../../components/ui/empty-state";
import { NewsFilters } from "../../../features/public/components/filters";
import { NewsCard } from "../../../features/public/components/news-card";
import { PaginationControls } from "../../../features/public/components/pagination";
import { getNewsList } from "../../../features/public/data/intelligence";
import { createPageMetadata } from "../../../features/public/lib/seo";

export const metadata = createPageMetadata({ title: "News", description: "Latest multilingual food and beverage intelligence news with filters and pagination.", path: "/news" });

export default async function NewsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const data = await getNewsList(params);
  return <div><div className="mb-8"><h1 className="text-4xl font-black">News Intelligence</h1><p className="mt-2 text-slate-500">Filter by category, country, brand, language, date range, and ranking signal.</p></div><NewsFilters searchParams={params} />{data.items.length ? <div className="mt-8 grid gap-4 lg:grid-cols-3">{data.items.map((news) => <NewsCard key={news.id} news={news} />)}</div> : <div className="mt-8"><EmptyState title="No articles found" description="Try removing a filter or searching for a broader topic." /></div>}<PaginationControls pathname="/news" page={data.page} hasNextPage={data.hasNextPage} searchParams={params} /></div>;
}
