"use client";

import { Button } from "../components/ui/button";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return <html><body><div className="mx-auto max-w-xl p-10 text-center"><h1 className="text-2xl font-bold">Something went wrong</h1><p className="mt-2 text-slate-500">{error.message}</p><Button className="mt-6" onClick={reset}>Try again</Button></div></body></html>;
}
