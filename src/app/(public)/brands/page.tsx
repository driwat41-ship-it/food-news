import { EntityCard } from "../../../features/public/components/entity-card";
import { getBrands } from "../../../features/public/data/intelligence";
import { createPageMetadata } from "../../../features/public/lib/seo";

export const metadata = createPageMetadata({ title: "Brands", description: "Track global food and beverage brands, chains, QSR operators, FMCG companies, and beverage businesses.", path: "/brands" });

export default async function BrandsPage() {
  const brands = await getBrands();
  return <div><h1 className="text-4xl font-black">Brand Intelligence</h1><p className="mt-2 text-slate-500">Profiles, mentions, launches, expansion, funding, and franchise signals.</p><div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{brands.map((brand) => <EntityCard key={brand.id} href={`/brands/${brand.slug}`} title={brand.name} description={brand.description} stat={`${brand.mentionedCount} mentions`} badge={brand.industryType} />)}</div></div>;
}
