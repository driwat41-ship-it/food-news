import Link from "next/link";
import { SearchBar } from "../../features/public/components/search-bar";
import { LanguageSwitcher } from "../../features/public/components/language-switcher";

const nav = [
  ["News", "/news"],
  ["Brands", "/brands"],
  ["Countries", "/countries"],
  ["Categories", "/categories"],
  ["Reports", "/reports"],
];

export function SiteHeader() {
  return <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-center justify-between gap-4"><Link href="/" className="text-lg font-black tracking-tight text-slate-950 dark:text-white">GFBI</Link><div className="lg:hidden"><LanguageSwitcher /></div></div><nav className="flex gap-4 overflow-x-auto text-sm font-semibold text-slate-600 dark:text-slate-300">{nav.map(([label, href]) => <Link key={href} href={href} className="hover:text-emerald-700 dark:hover:text-emerald-300">{label}</Link>)}</nav><div className="hidden min-w-[280px] max-w-md flex-1 lg:block"><SearchBar compact /></div><div className="hidden lg:block"><LanguageSwitcher /></div></div></header>;
}
