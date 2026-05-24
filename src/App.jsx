import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "./i18n";

import {
  BarChart3,
  Bot,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  Coffee,
  Filter,
  Flame,
  Globe2,
  Hash,
  Newspaper,
  Search,
  Share2,
  Sparkles,
  Sun,
  Moon,
  TrendingUp,
  Utensils,
  X,
  Menu,
} from "lucide-react";

import { createIntelligenceData, regions } from "./data/mockData";
import { fetchLiveIntelligenceData } from "./data/liveData";

const navItems = [
  ["nav_overview", "overview", BarChart3],
  ["nav_news", "news", Newspaper],
  ["nav_social", "social", Share2],
  ["nav_countries", "countries", Globe2],
  ["nav_brands", "brands", Building2],
  ["nav_tiktok", "tiktok", Flame],
  ["nav_ai", "ai", Bot]
];

function App() {
  const { t, lang, setLang } = useI18n();
  const baseData = useMemo(createIntelligenceData, []);
  const [liveData, setLiveData] = useState(null);
  const [loadingLive, setLoadingLive] = useState(false);
  const [dark, setDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [region, setRegion] = useState("All Regions");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("Month");


  useEffect(() => {
    let active = true;
    const loadLiveData = async () => {
      setLoadingLive(true);
      try {
        const latest = await fetchLiveIntelligenceData();
        if (active) setLiveData(latest);
      } catch (error) {
        console.error("Live data load failed", error);
      } finally {
        if (active) setLoadingLive(false);
      }
    };

    loadLiveData();
    const timer = setInterval(loadLiveData, 60 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const data = useMemo(() => ({
    ...baseData,
    ...(liveData
      ? {
          news: liveData.news,
          trendSeries: liveData.trendSeries,
          socialSeries: liveData.socialSeries,
          aiInsights: liveData.aiInsights
        }
      : {})
  }), [baseData, liveData]);

  const countryOptions = region === "All Regions" ? data.countryData : data.countryData.filter((item) => item.region === region);
  const filteredCountries = countryOptions.filter((item) => item.country.toLowerCase().includes(query.toLowerCase()));
  const filteredNews = data.news.filter((item) => `${item.title} ${item.country} ${item.category}`.toLowerCase().includes(query.toLowerCase()));
  const filteredBrands = data.brandData.filter((item) => item.brand.toLowerCase().includes(query.toLowerCase()));

  const totals = {
    news: data.news.reduce((sum, item) => sum + item.heat, 0),
    reach: data.platformData.reduce((sum, item) => sum + item.reach, 0),
    markets: data.countryData.length,
    brands: data.brandData.length
  };

  return (
    <main className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-zinc-100 text-zinc-950 transition-colors duration-500 dark:bg-[#07080a] dark:text-white">
        <div className="pointer-events-none fixed inset-0 intel-grid opacity-70" />
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-zinc-200 bg-white/92 px-4 py-4 backdrop-blur-2xl transition-transform duration-300 dark:border-white/10 dark:bg-black/82 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </aside>
        {sidebarOpen && (
          <button className="fixed inset-0 z-40 bg-black/40 lg:hidden" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />
        )}

        <div className="relative lg:pl-72">
          <header className="sticky top-0 z-30 border-b border-zinc-200 bg-zinc-100/80 px-4 py-3 backdrop-blur-2xl dark:border-white/10 dark:bg-[#07080a]/78 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  className="grid size-10 place-items-center rounded-xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-white/5 lg:hidden"
                  aria-label="Open navigation"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu size={18} />
                </button>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">{t("app_subtitle")}</p>
                  <h1 className="text-xl font-semibold tracking-normal md:text-2xl">{t("app_title")}</h1>
                </div>
              </div>
              <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
                <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-500 dark:border-white/10 dark:bg-white/5 md:w-72 md:flex-none">
                  <Search size={16} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t("search_placeholder")}
                    className="min-w-0 flex-1 bg-transparent text-zinc-900 outline-none placeholder:text-zinc-500 dark:text-white"
                  />
                </div>
                <button
                  className="rounded-xl border border-zinc-200 bg-white px-3 text-xs dark:border-white/10 dark:bg-white/5"
                  onClick={() => setLang(lang === "zh" ? "en" : "zh")}
                >
                  {t("lang_label")}: {lang === "zh" ? "中文" : "English"}
                </button>
                <button
                  className="grid size-10 place-items-center rounded-xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-white/5"
                  aria-label="Toggle dark mode"
                  onClick={() => setDark((value) => !value)}
                >
                  {dark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
            </div>
          </header>

          <div className="space-y-5 px-4 py-5 md:px-6">
            <section id="overview" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {liveData && (
                <div className="md:col-span-2 xl:col-span-4 rounded-2xl border border-zinc-200 bg-white/80 p-3 text-xs text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                  Live sync: {new Date(liveData.lastUpdated).toLocaleString()} · {loadingLive ? "updating..." : "stable"} · {liveData.sourceStatus.map((s) => `${s.source}:${s.count}`).join(" | ")}
                </div>
              )}
              <StatCard title={t("stats_news")} value={formatNumber(totals.news)} change="+24.8%" icon={Newspaper} />
              <StatCard title={t("stats_reach")} value={formatNumber(totals.reach)} change="+31.2%" icon={Share2} />
              <StatCard title={t("stats_markets")} value={totals.markets} change="9 regions" icon={Globe2} />
              <StatCard title={t("stats_brands")} value={totals.brands} change="20 watchlist" icon={Building2} />
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
              <Panel
                title={t("panel_trend")}
                subtitle="Tea, coffee, fried chicken and chain restaurant global trend signals (hourly refreshed)."
                action={<Segmented value={period} options={["Week", "Month"]} onChange={setPeriod} />}
              >
                <LineChart data={period === "Month" ? data.trendSeries : data.trendSeries.slice(-7)} />
              </Panel>
              <Panel title={t("panel_mix")} subtitle="重点监测品类热度分布">
                <DonutChart
                  data={liveData?.categoryCounts || [[t("tea"), 28],[t("coffee"), 20],[t("fried"), 18],[t("chain"), 34]]}
                />
              </Panel>
            </section>

            <section id="news" className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <Panel title={t("panel_news")} subtitle="Google News / Reddit / X / TikTok / YouTube / Facebook / Instagram | Real-time ingest">
                <div className="space-y-3">
                  {filteredNews.map((item) => (
                    <NewsRow key={`${item.title}-${item.time}`} item={item} originalLabel={t("original")} />
                  ))}
                </div>
              </Panel>
              <Panel title={t("panel_ai_daily")} subtitle="自动总结每日重点新闻、趋势和 AI Insight">
                <div className="space-y-3">
                  {data.aiInsights.map((insight, index) => (
                    <div key={insight} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-black/24">
                      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                        <Sparkles size={16} />
                        AI Insight {index + 1}
                      </div>
                      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{insight}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </section>

            <section id="social" className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <Panel title="Global Social Monitoring" subtitle="Followers, views, reach, engagement, hashtags and viral signals.">
                <div className="grid gap-3 sm:grid-cols-2">
                  {data.platformData.slice(0, 8).map((item) => (
                    <PlatformCard key={item.platform} item={item} />
                  ))}
                </div>
              </Panel>
              <Panel title="Social Heat Trend">
                <BarChart data={data.socialSeries} />
              </Panel>
            </section>

            <section id="countries" className="grid gap-4 xl:grid-cols-[1fr_1fr]">
              <Panel
                title="Global Country Filter"
                subtitle="支持全球国家和地区搜索、区域筛选、热门国家排序。"
                action={<RegionSelect region={region} setRegion={setRegion} />}
              >
                <CountryTable countries={filteredCountries.slice(0, 12)} />
              </Panel>
              <Panel title="Global Map Heatmap" subtitle="Market heat, social heat and news density.">
                <Heatmap data={data.heatmap} />
              </Panel>
            </section>

            <section id="brands" className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <Panel title="Brand Heat Ranking" subtitle="茶饮、咖啡、炸鸡、小食品牌全球监测。">
                <BrandRanking brands={filteredBrands.slice(0, 12)} />
              </Panel>
              <Panel title="Expansion Radar">
                <div className="space-y-3">
                  {data.brandData.slice(0, 7).map((brand) => (
                    <div key={brand.brand} className="rounded-2xl border border-zinc-200 p-4 dark:border-white/10">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{brand.brand}</p>
                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                          {brand.category}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-zinc-500">{brand.expansion}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </section>

            <section id="tiktok" className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
              <Panel title="TikTok Trend Module" subtitle="热门饮品、炸鸡、小食、话题、营销、门店设计与达人内容。">
                <div className="grid gap-3 sm:grid-cols-2">
                  {data.tiktokTrends.map((trend, index) => (
                    <div key={trend} className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.04]">
                      <div className="mb-5 flex items-center justify-between">
                        <span className="grid size-9 place-items-center rounded-xl bg-black text-white dark:bg-white dark:text-black">
                          <Flame size={16} />
                        </span>
                        <span className="text-xs text-zinc-500">Viral {index + 1}</span>
                      </div>
                      <p className="font-medium">{trend}</p>
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel title="Hot Hashtags & Music">
                <div className="grid gap-4 md:grid-cols-2">
                  <TagCloud />
                  <TrendList />
                </div>
              </Panel>
            </section>

            <section id="ai" className="grid gap-4 xl:grid-cols-[1fr_1fr]">
              <Panel title="AI Analysis Studio" subtitle="趋势预测、行业洞察、爆款分析、内容建议和 Caption Generator。">
                <div className="grid gap-3 sm:grid-cols-2">
                  {["AI Trend Forecast", "AI Industry Insight", "AI Viral Analyzer", "AI Caption Generator"].map((item) => (
                    <button key={item} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-left transition hover:-translate-y-1 hover:bg-white dark:border-white/10 dark:bg-black/24 dark:hover:bg-white/[0.06]">
                      <Bot className="mb-4" size={22} />
                      <p className="font-medium">{item}</p>
                      <p className="mt-2 text-sm leading-6 text-zinc-500">Generate structured intelligence output for global F&B teams.</p>
                    </button>
                  ))}
                </div>
              </Panel>
              <Panel title="API-Ready Data Structure">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-950 p-4 font-mono text-xs leading-6 text-zinc-200 dark:border-white/10">
                  <p>{`{`}</p>
                  <p className="pl-4">{`sources: ["Google News", "RSS", "Reddit", "Trends"],`}</p>
                  <p className="pl-4">{`entities: ["brands", "countries", "platforms"],`}</p>
                  <p className="pl-4">{`modules: ["news", "social", "heatmap", "ai"],`}</p>
                  <p className="pl-4">{`refreshInterval: "daily | realtime"`}</p>
                  <p>{`}`}</p>
                </div>
              </Panel>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function Sidebar({ onClose }) {
  const { t } = useI18n();
  return (
    <div className="flex h-full flex-col">
      <div className="mb-7 flex items-center justify-between">
        <a href="#overview" className="flex items-center gap-3" onClick={onClose}>
          <span className="grid size-10 place-items-center rounded-2xl bg-black text-sm font-semibold text-white dark:bg-white dark:text-black">
            TI
          </span>
          <div>
            <p className="text-sm font-semibold tracking-[0.2em]">TEA INTEL</p>
            <p className="text-xs text-zinc-500">Global F&B OS</p>
          </div>
        </a>
        <button className="grid size-9 place-items-center rounded-xl border border-zinc-200 dark:border-white/10 lg:hidden" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
      <nav className="space-y-1">
        {navItems.map(([label, id, Icon], index) => (
          <a
            key={t(label)}
            href={`#${id}`}
            onClick={onClose}
            className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
              index === 0
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-black dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
            }`}
          >
            <Icon size={18} />
            {t(label)}
          </a>
        ))}
      </nav>
      <div className="mt-auto rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Live Scope</p>
        <p className="mt-2 text-sm font-medium">F&B Intelligence Mesh</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">News, social, countries, brands and AI reports.</p>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, action, children }) {
  return (
    <section className="animate-rise rounded-3xl border border-zinc-200 bg-white/92 p-4 shadow-[0_1px_0_rgba(0,0,0,0.03)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045] md:p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold tracking-normal">{title}</h2>
          {subtitle && <p className="mt-1 text-sm leading-6 text-zinc-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatCard({ title, value, change, icon: Icon }) {
  return (
    <article className="animate-rise rounded-3xl border border-zinc-200 bg-white p-5 transition duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.05]">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-500">{title}</span>
        <span className="grid size-10 place-items-center rounded-2xl bg-zinc-100 dark:bg-white/10">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-normal">{value}</p>
      <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">{change}</p>
    </article>
  );
}

function Segmented({ value, options, onChange }) {
  return (
    <div className="flex rounded-xl border border-zinc-200 bg-zinc-50 p-1 text-xs dark:border-white/10 dark:bg-black/25">
      {options.map((option) => (
        <button
          key={option}
          className={`rounded-lg px-3 py-1.5 transition ${value === option ? "bg-black text-white dark:bg-white dark:text-black" : "text-zinc-500"}`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function RegionSelect({ region, setRegion }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:border-white/10 dark:bg-black/25">
      <Filter size={14} />
      <select value={region} onChange={(event) => setRegion(event.target.value)} className="bg-transparent text-zinc-700 outline-none dark:text-zinc-200">
        <option>All Regions</option>
        {Object.keys(regions).map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </label>
  );
}

function LineChart({ data }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 86 - ((value - min) / (max - min || 1)) * 68;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <div className="h-72">
      <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
        {[20, 40, 60, 80].map((line) => (
          <line key={line} x1="0" x2="100" y1={line} y2={line} className="stroke-zinc-200 dark:stroke-white/10" strokeWidth="0.35" />
        ))}
        <polyline points={points} fill="none" className="stroke-black dark:stroke-white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" />
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 86 - ((value - min) / (max - min || 1)) * 68;
          return <circle key={`${value}-${index}`} cx={x} cy={y} r="1.45" className="fill-white stroke-black dark:fill-black dark:stroke-white" strokeWidth="1" />;
        })}
      </svg>
    </div>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data);
  return (
    <div className="flex h-72 items-end gap-2">
      {data.map((value, index) => (
        <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-2">
          <div className="w-full rounded-t-xl bg-zinc-950 transition duration-500 hover:bg-zinc-600 dark:bg-white" style={{ height: `${(value / max) * 92}%` }} />
          <span className="text-[10px] text-zinc-500">{index + 1}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data }) {
  const { t } = useI18n();
  let offset = 25;
  return (
    <div className="grid gap-5 md:grid-cols-[190px_1fr] md:items-center xl:grid-cols-1">
      <svg viewBox="0 0 42 42" className="mx-auto size-44 -rotate-90">
        <circle cx="21" cy="21" r="15.915" fill="transparent" className="stroke-zinc-200 dark:stroke-white/10" strokeWidth="5" />
        {data.map(([label, value], index) => {
          const circle = (
            <circle
              key={t(label)}
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              strokeWidth="5"
              strokeDasharray={`${value} ${100 - value}`}
              strokeDashoffset={offset}
              className={["stroke-black dark:stroke-white", "stroke-zinc-600 dark:stroke-zinc-300", "stroke-zinc-500", "stroke-zinc-400", "stroke-zinc-300", "stroke-zinc-200 dark:stroke-zinc-700"][index]}
            />
          );
          offset -= value;
          return circle;
        })}
      </svg>
      <div className="space-y-3">
        {data.map(([label, value]) => (
          <div key={t(label)} className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">{t(label)}</span>
            <span className="font-medium">{value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewsRow({ item, originalLabel }) {
  return (
    <article className="rounded-2xl border border-zinc-200 p-4 transition hover:-translate-y-0.5 hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/[0.03]">
      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
        <span>{item.source}</span>
        <span>/</span>
        <span>{item.country}</span>
        <span>/</span>
        <span>{item.time}</span>
      </div>
      <h3 className="mt-2 font-medium">{item.translatedTitle || item.title}</h3>
      {item.link && <a href={item.link} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-zinc-500 underline">{originalLabel}</a>}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 dark:bg-white/10 dark:text-zinc-300">{item.category}</span>
        <span className="rounded-full bg-black px-3 py-1 text-xs text-white dark:bg-white dark:text-black">Heat {item.heat}</span>
        <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-500 dark:border-white/10">{item.sentiment}</span>
      </div>
    </article>
  );
}

function PlatformCard({ item }) {
  return (
    <div className="rounded-2xl border border-zinc-200 p-4 dark:border-white/10">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-medium">{item.platform}</p>
        <span className="text-xs text-emerald-600 dark:text-emerald-400">+{item.engagement.toFixed(1)}%</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Metric label="Followers" value={formatNumber(item.followers)} />
        <Metric label="Views" value={formatNumber(item.views)} />
        <Metric label="Reach" value={formatNumber(item.reach)} />
        <Metric label="Posts" value={item.trendingPosts} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {item.hashtags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
            <Hash size={11} />
            {tag.replace("#", "")}
          </span>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  const { t } = useI18n();
  return (
    <div>
      <p className="text-xs text-zinc-500">{t(label)}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function CountryTable({ countries }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="text-xs uppercase tracking-[0.18em] text-zinc-500">
          <tr>
            <th className="pb-4 font-medium">Country</th>
            <th className="pb-4 font-medium">Region</th>
            <th className="pb-4 font-medium">News</th>
            <th className="pb-4 font-medium">Top Brand</th>
            <th className="pb-4 font-medium">Social</th>
            <th className="pb-4 font-medium">Market</th>
            <th className="pb-4 font-medium">Trend</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-white/10">
          {countries.map((item) => (
            <tr key={item.country} className="transition hover:bg-zinc-50 dark:hover:bg-white/[0.03]">
              <td className="py-4 font-medium">{item.country}</td>
              <td className="py-4 text-zinc-500">{item.region}</td>
              <td className="py-4">{item.news}</td>
              <td className="py-4">{item.topBrand}</td>
              <td className="py-4">{item.socialHeat}</td>
              <td className="py-4">{item.marketHeat}</td>
              <td className="py-4">{item.trend}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Heatmap({ data }) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {data.map((item) => (
        <div
          key={item.country}
          className="group aspect-square rounded-2xl border border-zinc-200 p-2 transition hover:-translate-y-1 dark:border-white/10"
          style={{ backgroundColor: `rgba(255,255,255,${item.marketHeat / 165})` }}
        >
          <div className="flex h-full flex-col justify-between">
            <span className="text-[10px] leading-tight text-zinc-500 dark:text-zinc-400">{item.country.slice(0, 10)}</span>
            <span className="text-sm font-semibold">{item.marketHeat}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function BrandRanking({ brands }) {
  const max = Math.max(...brands.map((item) => item.socialHeat));
  return (
    <div className="space-y-4">
      {brands.map((item, index) => (
        <div key={item.brand}>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-black text-xs text-white dark:bg-white dark:text-black">{index + 1}</span>
              <div className="min-w-0">
                <p className="truncate font-medium">{item.brand}</p>
                <p className="text-xs text-zinc-500">{item.campaign}</p>
              </div>
            </div>
            <span className="text-zinc-500">{item.socialHeat}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
            <div className="h-full rounded-full bg-black dark:bg-white" style={{ width: `${(item.socialHeat / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TagCloud() {
  const tags = ["#bubbletea", "#coffeechain", "#qsr", "#friedchicken", "#snacktok", "#storedesign", "#franchise", "#dessert"];
  return (
    <div className="rounded-2xl border border-zinc-200 p-4 dark:border-white/10">
      <p className="mb-4 flex items-center gap-2 font-medium">
        <Hash size={16} />
        Hot Hashtags
      </p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="rounded-full bg-zinc-100 px-3 py-2 text-xs text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function TrendList() {
  return (
    <div className="rounded-2xl border border-zinc-200 p-4 dark:border-white/10">
      <p className="mb-4 flex items-center gap-2 font-medium">
        <Coffee size={16} />
        Viral Formats
      </p>
      <div className="space-y-3 text-sm">
        {["Street tasting", "Queue reveal", "ASMR drink build", "Limited combo", "Founder story"].map((item, index) => (
          <div key={item} className="flex items-center justify-between">
            <span>{item}</span>
            <span className="text-zinc-500">{88 - index * 7}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatNumber(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

export default App;
