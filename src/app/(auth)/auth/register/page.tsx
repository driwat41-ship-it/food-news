import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Register | Global Food & Beverage Intelligence",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Account access</p>
      <h1 className="mt-3 text-3xl font-black">Request access</h1>
      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
        Registration is approval-based for analysts, editors, and administrators. Connect your production auth provider to enable onboarding.
      </p>
      <Link className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white dark:bg-white dark:text-slate-950" href="/auth/login">
        Back to login
      </Link>
    </div>
  );
}
