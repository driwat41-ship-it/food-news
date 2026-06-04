import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";

export function SearchBar({ defaultValue = "", compact = false }: { defaultValue?: string; compact?: boolean }) {
  return <form action="/search" className={`flex w-full gap-2 ${compact ? "" : "mx-auto max-w-3xl"}`}><Input name="q" defaultValue={defaultValue} placeholder="Search brands, categories, countries, products, funding events..." /><Button type="submit">Search</Button></form>;
}
