import type { ReactNode } from "react";

export function Field({ label, name, defaultValue, type = "text", required = false }: { label: string; name: string; defaultValue?: string | number | null; type?: string; required?: boolean }) {
  return <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-slate-200"><span>{label}</span><input className="rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" name={name} type={type} required={required} defaultValue={defaultValue ?? ""} /></label>;
}

export function TextAreaField({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string | null }) {
  return <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-slate-200"><span>{label}</span><textarea className="min-h-32 rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" name={name} defaultValue={defaultValue ?? ""} /></label>;
}

export function AdminForm({ action, children, submitLabel = "Save" }: { action: (formData: FormData) => Promise<void>; children: ReactNode; submitLabel?: string }) {
  return <form action={action} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">{children}<button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700" type="submit">{submitLabel}</button></form>;
}
