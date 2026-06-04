import { ButtonLink } from "../../../components/ui/button";
import { buildPageHref } from "../lib/pagination";

export function PaginationControls({ pathname, page, hasNextPage, searchParams }: { pathname: string; page: number; hasNextPage: boolean; searchParams: Record<string, string | string[] | undefined> }) {
  return <nav className="mt-8 flex items-center justify-center gap-3">{page > 1 ? <ButtonLink variant="secondary" href={buildPageHref(pathname, searchParams, page - 1)}>Previous</ButtonLink> : null}<span className="text-sm text-slate-500">Page {page}</span>{hasNextPage ? <ButtonLink variant="secondary" href={buildPageHref(pathname, searchParams, page + 1)}>Next</ButtonLink> : null}</nav>;
}
