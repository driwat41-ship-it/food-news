import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: "primary" | "secondary" | "ghost" };

const styles = {
  primary: "bg-emerald-600 text-white hover:bg-emerald-700",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
  ghost: "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
};

export function Button({ children, className = "", variant = "primary", ...props }: ButtonProps) {
  return <button className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition ${styles[variant]} ${className}`} {...props}>{children}</button>;
}

export function ButtonLink({ children, className = "", variant = "primary", href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; href: string; variant?: keyof typeof styles }) {
  return <Link href={href} className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition ${styles[variant]} ${className}`} {...props}>{children}</Link>;
}
