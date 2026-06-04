"use client";
import { Button } from "../../../components/ui/button";
export default function AdminError({ error, reset }: { error: Error; reset: () => void }) { return <div className="rounded-2xl border border-red-200 p-6"><h1 className="font-bold">Admin error</h1><p>{error.message}</p><Button onClick={reset}>Retry</Button></div>; }
