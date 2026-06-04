import Link from "next/link";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { EmptyState } from "../../../components/ui/empty-state";
import { Section } from "../../../features/public/components/section";
import { getDailyBriefData } from "../../../features/public/data/intelligence";
import { formatDate, timeAgo } from "../../../features/public/lib/format";
import { createPageMetadata } from "../../../features/public/lib/seo";
import type { PublicBriefEntitySignal, PublicBriefEvent, PublicBriefSignal } from "../../../features/public/types";

export const metadata = createPageMetadata({
  title: "Daily Intelligence Brief",
  description: "A quality-ranked daily brief of AI-processed food and beverage news signals.",
});

function SignalScore({ score }: { score: number }) {
  return <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">{score || "New"}</span>;
}

function SignalCard({ signal, priority = false }: { signal: PublicBriefSignal; priority?: boolean }) {
  return (
    <Card className={priority ? "border-emerald-300 dark:border-emerald-800" : ""}>
      <CardHeader>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <SignalScore score={signal.score} />
          {signal.category ? <Badge variant="accent">{signal.category}</Badge> : null}
          {signal.country ? <Badge variant="outline">{signal.country}</Badge> : null}
          <Badge>{timeAgo(signal.publishedAt)}</Badge>
        </div>
        <Link href={`/news/${signal.slug}`} className="group">
          <h3 className="text-lg font-bold leading-snug text-slate-950 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-300">{signal.title}</h3>
        </Link>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{signal.summary ?? "Summary pending AI review."}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {signal.brands.slice(0, 3).map((brand) => <Badge key={brand} variant="outline">{brand}</Badge>)}
          {signal.tags.slice(0, 3).map((tag) => <Badge key={tag}>{tag}</Badge>)}
        </div>
        <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">{signal.source ?? "Unknown source"}</div>
      </CardContent>
    </Card>
  );
}

function EventList({ items, emptyTitle }: { items: PublicBriefEvent[]; emptyTitle: string }) {
  if (!items.length) return <EmptyState title={emptyTitle} description="No high-quality processed signals are available for this section yet." />;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <SignalScore score={item.score} />
              {item.amountLabel ? <Badge variant="accent">{item.amountLabel}</Badge> : null}
              {item.country ? <Badge variant="outline">{item.country}</Badge> : null}
            </div>
            {item.href ? (
              <Link href={item.href} className="group">
                <h3 className="text-base font-bold leading-snug text-slate-950 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-300">{item.title}</h3>
              </Link>
            ) : (
              <h3 className="text-base font-bold leading-snug text-slate-950 dark:text-white">{item.title}</h3>
            )}
          </CardHeader>
          <CardContent>
            <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.summary ?? "Signal summary pending review."}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.brand ? <Badge variant="outline">{item.brand}</Badge> : null}
              {item.category ? <Badge>{item.category}</Badge> : null}
            </div>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">{formatDate(item.date)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EntityWatchList({ items, emptyTitle }: { items: PublicBriefEntitySignal[]; emptyTitle: string }) {
  if (!items.length) return <EmptyState title={emptyTitle} description="No entity signals have cleared the AI-processed quality threshold yet." />;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <SignalScore score={item.score} />
              <Badge variant="accent">{item.count} signals</Badge>
              {item.context ? <Badge variant="outline">{item.context}</Badge> : null}
            </div>
            <Link href={item.href} className="group">
              <h3 className="text-lg font-bold text-slate-950 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-300">{item.name}</h3>
            </Link>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description ?? item.latestSignal?.summary ?? "Watch for additional processed signals."}</p>
            {item.latestSignal ? <p className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">Latest: {item.latestSignal.title}</p> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function DailyBriefPage() {
  const brief = await getDailyBriefData();
  const hasSignals = brief.topSignals.length || brief.expansionSignals.length || brief.fundingAndMna.length || brief.productLaunches.length;

  return (
    <div>
      <section className="rounded-3xl bg-slate-950 p-8 text-white md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">Daily Intelligence Brief</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_280px] lg:items-end">
          <div>
            <h1 className="max-w-4xl text-4xl font-black tracking-tight md:text-6xl">Most important food and beverage signals</h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-300">A quality-ranked readout from AI-processed news, focused on market movement over feed volume.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-3xl font-black">{brief.processedNewsCount}</p>
            <p className="mt-1 text-sm text-slate-300">processed articles in scope</p>
            <p className="mt-4 text-xs text-slate-400">Generated {formatDate(brief.generatedAt)}</p>
          </div>
        </div>
      </section>

      <Section title="Executive Summary" description="Concise analyst-style readout from the current processed signal set.">
        {brief.processedNewsCount ? (
          <div className="grid gap-4 md:grid-cols-2">
            {brief.executiveSummary.map((line) => (
              <Card key={line}>
                <CardContent className="pt-5">
                  <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">{line}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="Daily brief is waiting for processed news" description="Once AI processing completes, this page will populate with ranked signals and entity watchlists." />
        )}
      </Section>

      <Section title="Top Signals" description="Highest-quality processed articles, ranked by quality, relevance, and AI confidence.">
        {brief.topSignals.length ? <div className="grid gap-4 lg:grid-cols-2">{brief.topSignals.map((signal, index) => <SignalCard key={signal.id} signal={signal} priority={index < 2} />)}</div> : <EmptyState title="No top signals yet" description="Processed news exists only after AI enrichment has completed." />}
      </Section>

      {hasSignals ? (
        <>
          <Section title="Expansion Signals"><EventList items={brief.expansionSignals} emptyTitle="No expansion signals yet" /></Section>
          <Section title="Funding & M&A"><EventList items={brief.fundingAndMna} emptyTitle="No funding or M&A signals yet" /></Section>
          <Section title="Product Launches"><EventList items={brief.productLaunches} emptyTitle="No product launches yet" /></Section>
          <Section title="Brands To Watch"><EntityWatchList items={brief.brandsToWatch} emptyTitle="No brands to watch yet" /></Section>
          <Section title="Countries To Watch"><EntityWatchList items={brief.countriesToWatch} emptyTitle="No countries to watch yet" /></Section>
        </>
      ) : null}
    </div>
  );
}
