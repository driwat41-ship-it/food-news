import { EmptyState } from "../../../components/ui/empty-state";
import { NewsFilters } from "../../../features/public/components/filters";
import { NewsCard } from "../../../features/public/components/news-card";
import { PaginationControls } from "../../../features/public/components/pagination";
import { SearchBar } from "../../../features/public/components/search-bar";
import { searchIntelligence } from "../../../features/public/data/intelligence";
import { createPageMetadata } from "../../../features/public/lib/seo";

export const metadata = createPageMetadata({ title: "Search", description: "Search food and beverage intelligence across news, brands, countries, categories, and reports.", path: "/search", noIndex: true });

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const q = Array.isArray(params.q) ? params.q[0] : params.q;
  const results = await searchIntelligence(params);
  return <div><h1 className="text-4xl font-black">Search Intelligence</h1><div className="mt-6"><SearchBar defaultValue={q ?? ""} /></div><div className="mt-6"><NewsFilters searchParams={params} /></div>{!q ? <div className="mt-8"><EmptyState title="Search the intelligence database" description="Enter a keyword, brand, country, product, or market signal." /></div> : results.items.length ? <><div className="mt-8 grid gap-4 lg:grid-cols-3">{results.items.map((news) => <NewsCard key={news.id} news={news} />)}</div><PaginationControls pathname="/search" page={results.page} hasNextPage={results.hasNextPage} searchParams={params} /></> : <div className="mt-8"><EmptyState title="No results" description="Try a broader keyword or fewer filters." /></div>}</div>;
}
