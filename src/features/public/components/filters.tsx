import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

export function NewsFilters({ searchParams = {} }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const value = (key: string) => Array.isArray(searchParams[key]) ? searchParams[key]?.[0] : searchParams[key];
  return <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 md:grid-cols-3 lg:grid-cols-6"><Input name="category" placeholder="Category slug" defaultValue={value("category")} /><Input name="country" placeholder="Country slug" defaultValue={value("country")} /><Input name="brand" placeholder="Brand slug" defaultValue={value("brand")} /><Input name="language" placeholder="EN / ZH" defaultValue={value("language")} /><select name="sort" defaultValue={value("sort") ?? "latest"} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="latest">Latest</option><option value="most-relevant">Most relevant</option><option value="most-mentioned">Most mentioned</option></select><Button type="submit">Apply</Button></form>;
}
