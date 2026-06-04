"use client";

import { Button } from "../../components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/30"><h1 className="text-xl font-bold">Unable to load intelligence</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{error.message}</p><Button className="mt-5" onClick={reset}>Retry</Button></div>;
}
