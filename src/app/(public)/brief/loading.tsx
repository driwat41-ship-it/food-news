import { Skeleton } from "../../../components/ui/skeleton";

export default function DailyBriefLoading() {
  return (
    <div>
      <section className="rounded-3xl bg-slate-950 p-8 md:p-12">
        <Skeleton className="h-4 w-56 bg-slate-800" />
        <Skeleton className="mt-6 h-14 max-w-3xl bg-slate-800" />
        <Skeleton className="mt-4 h-6 max-w-2xl bg-slate-800" />
      </section>
      <div className="space-y-8 py-8">
        {["summary", "signals", "expansion"].map((section) => (
          <section key={section}>
            <Skeleton className="h-8 w-64" />
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((item) => <Skeleton key={item} className="h-48" />)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
