"use client";

import type { ReactNode } from "react";

export function ConfirmButton({ children, action, message = "Are you sure?", className = "" }: { children: ReactNode; action: () => Promise<void>; message?: string; className?: string }) {
  return <button className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${className || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`} onClick={async () => { if (confirm(message)) await action(); }}>{children}</button>;
}
