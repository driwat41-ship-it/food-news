import { EntityCard } from "../../../features/public/components/entity-card";
import { getCountries } from "../../../features/public/data/intelligence";
import { createPageMetadata } from "../../../features/public/lib/seo";

export const metadata = createPageMetadata({ title: "Countries", description: "Country and regional food and beverage market intelligence.", path: "/countries" });
export default async function CountriesPage() { const countries = await getCountries(); return <div><h1 className="text-4xl font-black">Country Intelligence</h1><p className="mt-2 text-slate-500">Local news, active brands, market trends, expansion, and franchise opportunities.</p><div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{countries.map((country) => <EntityCard key={country.id} href={`/countries/${country.slug}`} title={country.name} description={country.region} stat={`${country.mentionedCount} mentions`} />)}</div></div>; }
