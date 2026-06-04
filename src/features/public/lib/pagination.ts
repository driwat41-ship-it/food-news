export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 60;

export function getPagination(searchParams?: Record<string, string | string[] | undefined>) {
  const rawPage = Array.isArray(searchParams?.page) ? searchParams?.page[0] : searchParams?.page;
  const rawPageSize = Array.isArray(searchParams?.pageSize) ? searchParams?.pageSize[0] : searchParams?.pageSize;
  const page = Math.max(1, Number(rawPage ?? 1) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(rawPageSize ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function buildPageHref(pathname: string, searchParams: Record<string, string | string[] | undefined>, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (!value || key === "page") continue;
    if (Array.isArray(value)) value.forEach((entry) => params.append(key, entry));
    else params.set(key, value);
  }
  params.set("page", String(page));
  return `${pathname}?${params.toString()}`;
}
