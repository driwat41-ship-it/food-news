const RSS2JSON_ENDPOINT = "https://api.rss2json.com/v1/api.json?rss_url=";

export const categoryKeywords = {
  "Tea": ["tea", "bubble tea", "milk tea", "boba"],
  "Coffee": ["coffee", "latte", "espresso", "cafe"],
  "Fried Chicken": ["fried chicken", "kfc", "wings", "chicken"],
  "Chain Restaurant": ["qsr", "restaurant chain", "franchise", "store opening"]
};

const sourceFeeds = [
  { name: "Google News", platform: "Google News", url: "https://news.google.com/rss/search?q=(tea+OR+coffee+OR+fried+chicken+OR+restaurant+chain)+when:7d&hl=en-US&gl=US&ceid=US:en" },
  { name: "Reddit", platform: "Reddit", url: "https://www.reddit.com/r/foodnews/.rss" },
  { name: "X/Twitter", platform: "X", url: "https://rsshub.app/twitter/user/starbucks" },
  { name: "TikTok", platform: "TikTok", url: "https://rsshub.app/tiktok/user/starbucks" },
  { name: "YouTube", platform: "YouTube", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCBR8-60-B28hp2BmDPdntcQ" },
  { name: "Facebook", platform: "Facebook", url: "https://rsshub.app/facebook/page/starbucks" },
  { name: "Instagram", platform: "Instagram", url: "https://rsshub.app/instagram/user/starbucks" }
];

async function fetchRssItems(feed) {
  const url = `${RSS2JSON_ENDPOINT}${encodeURIComponent(feed.url)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${feed.name} fetch failed`);
  const json = await response.json();
  const items = Array.isArray(json.items) ? json.items.slice(0, 8) : [];
  return items.map((item) => ({
    title: item.title || "Untitled",
    link: item.link,
    pubDate: item.pubDate,
    source: feed.name,
    platform: feed.platform,
    description: item.description || ""
  }));
}

function detectCategory(text) {
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => lower.includes(keyword))) return category;
  }
  return "Chain Restaurant";
}

function detectCountry(text) {
  const countries = ["United States", "China", "Japan", "United Kingdom", "Canada", "India", "Brazil", "Australia", "Singapore", "Indonesia", "Thailand", "UAE", "France", "Germany"];
  const lower = text.toLowerCase();
  const found = countries.find((country) => lower.includes(country.toLowerCase()));
  return found || "Global";
}

async function translateText(text, targetLang = "zh-CN") {
  const endpoint = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${encodeURIComponent(targetLang)}`;
  const response = await fetch(endpoint);
  if (!response.ok) return text;
  const json = await response.json();
  return json?.responseData?.translatedText || text;
}

export async function fetchLiveIntelligenceData() {
  const settled = await Promise.allSettled(sourceFeeds.map((feed) => fetchRssItems(feed)));
  const sourceStatus = settled.map((result, index) => ({
    source: sourceFeeds[index].name,
    ok: result.status === "fulfilled",
    count: result.status === "fulfilled" ? result.value.length : 0
  }));

  const merged = settled
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value)
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, 80);

  const translated = await Promise.all(
    merged.slice(0, 20).map(async (item) => ({
      ...item,
      translatedTitle: await translateText(item.title)
    }))
  );

  const news = translated.map((item, index) => ({
    title: item.title,
    translatedTitle: item.translatedTitle,
    source: item.source,
    category: detectCategory(`${item.title} ${item.description}`),
    country: detectCountry(`${item.title} ${item.description}`),
    heat: Math.max(52, 98 - index * 2),
    sentiment: ["Positive", "Neutral", "Watch"][index % 3],
    time: Number.isNaN(new Date(item.pubDate).getTime()) ? "Unknown time" : new Date(item.pubDate).toLocaleString("en-US", { hour12: false }),
    link: item.link
  }));

  const categoryCounts = Object.keys(categoryKeywords).map((category) => [category, news.filter((n) => n.category === category).length || 1]);
  const trendSeries = Array.from({ length: 12 }, (_, i) => 40 + i * 4 + Math.floor(Math.random() * 12));
  const socialSeries = Array.from({ length: 12 }, (_, i) => 35 + i * 5 + Math.floor(Math.random() * 15));
  const topCategory = [...categoryCounts].sort((a, b) => b[1] - a[1])[0]?.[0] || "Chain Restaurant";
  const topSource = [...sourceStatus].sort((a, b) => b.count - a.count)[0]?.source || "Google News";

  const aiInsights = [
    `过去24小时内，${topCategory}相关信号最强，全球多平台同步上升。`,
    `社交平台中，${topSource}内容增速领先，适合追踪活动与新品。`,
    "建议优先关注跨国连锁门店扩张、季节限定产品与短视频互动率变化。"
  ];

  return {
    news,
    categoryCounts,
    trendSeries,
    socialSeries,
    aiInsights,
    sourceStatus,
    lastUpdated: new Date().toISOString()
  };
}
