import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Login | Global Food & Beverage Intelligence",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: { searchParams?: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const next = params?.next ?? "/admin";
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Secure access</p>
      <h1 className="mt-3 text-3xl font-black">Admin login</h1>
      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
        Connect NextAuth or Supabase Auth to complete sign-in. Admin routes require an authenticated user with ADMIN, EDITOR, or SUPER_ADMIN role.
      </p>
      <div className="mt-6 rounded-2xl bg-slate-100 p-4 text-sm dark:bg-slate-950">
        Requested destination: <code>{next}</code>
      </div>
      <Link className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white dark:bg-white dark:text-slate-950" href="/">
        Return to homepage
      </Link>
    </div>
  );
}
