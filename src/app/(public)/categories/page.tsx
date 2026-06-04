import { EntityCard } from "../../../features/public/components/entity-card";
import { getCategories } from "../../../features/public/data/intelligence";
import { createPageMetadata } from "../../../features/public/lib/seo";

export const metadata = createPageMetadata({ title: "Categories", description: "Category intelligence across tea, bubble tea, coffee, restaurant chains, QSR, and FMCG.", path: "/categories" });
export default async function CategoriesPage() { const categories = await getCategories(); return <div><h1 className="text-4xl font-black">Category Intelligence</h1><div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{categories.map((category) => <EntityCard key={category.id} href={`/categories/${category.slug}`} title={category.name} stat={`${category.newsCount} articles`} badge={category.industryType} />)}</div></div>; }
