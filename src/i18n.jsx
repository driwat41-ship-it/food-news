import { createContext, useContext, useMemo, useState } from "react";

const messages = {
  en: {
    nav_overview: "Overview",
    nav_news: "News Intel",
    nav_social: "Social Radar",
    nav_countries: "Countries",
    nav_brands: "Brands",
    nav_tiktok: "TikTok Trends",
    nav_ai: "AI Analysis",
    app_title: "Industry Signal Dashboard",
    app_subtitle: "Global F&B AI Intelligence",
    search_placeholder: "Search brand, country, news, keyword",
    lang_label: "Language",
    stats_news: "News Signals",
    stats_reach: "Social Reach",
    stats_markets: "Active Markets",
    stats_brands: "Brands Tracked",
    panel_trend: "Global Industry Trend",
    panel_mix: "Category Signal Mix",
    panel_news: "Global News Aggregation",
    panel_ai_daily: "AI Daily Summary",
    original: "Original",
    tea: "Tea",
    coffee: "Coffee",
    fried: "Fried Chicken",
    chain: "Chain Restaurant"
  },
  zh: {
    nav_overview: "总览",
    nav_news: "新闻情报",
    nav_social: "社媒雷达",
    nav_countries: "国家地区",
    nav_brands: "品牌",
    nav_tiktok: "TikTok 趋势",
    nav_ai: "AI 分析",
    app_title: "行业信号看板",
    app_subtitle: "全球餐饮 AI 情报",
    search_placeholder: "搜索品牌、国家、新闻、关键词",
    lang_label: "语言",
    stats_news: "新闻信号",
    stats_reach: "社媒触达",
    stats_markets: "活跃市场",
    stats_brands: "监测品牌",
    panel_trend: "全球行业趋势",
    panel_mix: "品类信号占比",
    panel_news: "全球新闻聚合",
    panel_ai_daily: "AI 每日摘要",
    original: "原文",
    tea: "茶饮",
    coffee: "咖啡",
    fried: "炸鸡",
    chain: "连锁餐饮"
  }
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const browser = typeof navigator !== "undefined" ? navigator.language.toLowerCase() : "en";
  const initial = browser.startsWith("zh") ? "zh" : "en";
  const [lang, setLang] = useState(initial);

  const value = useMemo(() => ({
    lang,
    setLang,
    t: (key) => messages[lang]?.[key] || messages.en[key] || key
  }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
