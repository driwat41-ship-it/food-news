import type { Metadata } from "next";
import "../styles.css";
import { SiteFooter } from "../components/layout/site-footer";
import { SiteHeader } from "../components/layout/site-header";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://global-food-intelligence.example"),
  title: "Global Food & Beverage Intelligence",
  description: "Real-time multilingual intelligence for tea, bubble tea, coffee, restaurant chains, QSR, and FMCG.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body className="min-h-screen bg-slate-50 text-slate-950 antialiased dark:bg-slate-950 dark:text-slate-50"><SiteHeader /><main className="mx-auto min-h-screen max-w-7xl px-4 py-6">{children}</main><SiteFooter /></body></html>;
}
