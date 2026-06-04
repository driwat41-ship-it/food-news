import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@gfbi.local";
const NOW = new Date();

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function assertUnique<T>(items: T[], getKey: (item: T) => string, label: string) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const item of items) {
    const key = getKey(item).trim().toLowerCase();
    if (seen.has(key)) duplicates.add(key);
    seen.add(key);
  }
  if (duplicates.size) throw new Error(`${label} must be unique. Duplicates: ${[...duplicates].join(", ")}`);
}

function assertUrl(value: string, label: string) {
  const parsed = new URL(value);
  if (!["http:", "https:"].includes(parsed.protocol)) throw new Error(`${label} must be an HTTP(S) URL: ${value}`);
}

const roles = [
  { name: "SUPER_ADMIN", description: "Unrestricted platform owner with billing, security, and data access.", permissions: { all: true } },
  { name: "ADMIN", description: "Administrative operator for sources, users, jobs, and settings.", permissions: { admin: true, review: true, sources: true } },
  { name: "EDITOR", description: "Editorial reviewer for AI output, article approval, tags, and taxonomy.", permissions: { review: true, news: true, taxonomy: true } },
  { name: "ANALYST", description: "Market analyst with report and dashboard access.", permissions: { reports: true, analytics: true } },
  { name: "CONTRIBUTOR", description: "Contributor who can submit or draft intelligence notes.", permissions: { drafts: true } },
  { name: "MEMBER", description: "Authenticated platform member with saved searches and watchlists.", permissions: { savedSearches: true, watchlists: true } },
  { name: "API_CLIENT", description: "Programmatic client scoped to API-key access.", permissions: { api: true } },
] as const;

const countries = [
  { name: "China", iso2: "CN", iso3: "CHN", region: "Asia", subregion: "Eastern Asia", currencyCode: "CNY", defaultLanguage: "ZH" },
  { name: "United States", iso2: "US", iso3: "USA", region: "Americas", subregion: "Northern America", currencyCode: "USD", defaultLanguage: "EN" },
  { name: "United Kingdom", iso2: "GB", iso3: "GBR", region: "Europe", subregion: "Northern Europe", currencyCode: "GBP", defaultLanguage: "EN" },
  { name: "Malaysia", iso2: "MY", iso3: "MYS", region: "Asia", subregion: "South-Eastern Asia", currencyCode: "MYR", defaultLanguage: "MS" },
  { name: "Singapore", iso2: "SG", iso3: "SGP", region: "Asia", subregion: "South-Eastern Asia", currencyCode: "SGD", defaultLanguage: "EN" },
  { name: "Indonesia", iso2: "ID", iso3: "IDN", region: "Asia", subregion: "South-Eastern Asia", currencyCode: "IDR", defaultLanguage: "ID" },
  { name: "Thailand", iso2: "TH", iso3: "THA", region: "Asia", subregion: "South-Eastern Asia", currencyCode: "THB", defaultLanguage: "TH" },
  { name: "Vietnam", iso2: "VN", iso3: "VNM", region: "Asia", subregion: "South-Eastern Asia", currencyCode: "VND", defaultLanguage: "VI" },
  { name: "Philippines", iso2: "PH", iso3: "PHL", region: "Asia", subregion: "South-Eastern Asia", currencyCode: "PHP", defaultLanguage: "EN" },
  { name: "Japan", iso2: "JP", iso3: "JPN", region: "Asia", subregion: "Eastern Asia", currencyCode: "JPY", defaultLanguage: "JA" },
  { name: "South Korea", iso2: "KR", iso3: "KOR", region: "Asia", subregion: "Eastern Asia", currencyCode: "KRW", defaultLanguage: "KO" },
  { name: "UAE", iso2: "AE", iso3: "ARE", region: "Asia", subregion: "Western Asia", currencyCode: "AED", defaultLanguage: "AR" },
  { name: "Saudi Arabia", iso2: "SA", iso3: "SAU", region: "Asia", subregion: "Western Asia", currencyCode: "SAR", defaultLanguage: "AR" },
  { name: "India", iso2: "IN", iso3: "IND", region: "Asia", subregion: "Southern Asia", currencyCode: "INR", defaultLanguage: "HI" },
  { name: "Australia", iso2: "AU", iso3: "AUS", region: "Oceania", subregion: "Australia and New Zealand", currencyCode: "AUD", defaultLanguage: "EN" },
  { name: "Canada", iso2: "CA", iso3: "CAN", region: "Americas", subregion: "Northern America", currencyCode: "CAD", defaultLanguage: "EN" },
  { name: "Taiwan", iso2: "TW", iso3: "TWN", region: "Asia", subregion: "Eastern Asia", currencyCode: "TWD", defaultLanguage: "ZH" },
  { name: "Switzerland", iso2: "CH", iso3: "CHE", region: "Europe", subregion: "Western Europe", currencyCode: "CHF", defaultLanguage: "DE" },
  { name: "France", iso2: "FR", iso3: "FRA", region: "Europe", subregion: "Western Europe", currencyCode: "EUR", defaultLanguage: "FR" },
] as const;

const categories = [
  { name: "Tea", industryType: "TEA", description: "Tea brands, production, retail concepts, supply, and global category signals." },
  { name: "Bubble Tea", industryType: "BUBBLE_TEA", description: "Milk tea, fruit tea, boba chains, store openings, and category competition." },
  { name: "Coffee", industryType: "COFFEE", description: "Coffee chains, specialty coffee, ready-to-drink coffee, beans, and cafe formats." },
  { name: "Restaurant Chains", industryType: "RESTAURANT_CHAINS", description: "Multi-unit restaurant operators, casual dining, fast casual, and brand portfolios." },
  { name: "QSR", industryType: "QSR", description: "Quick-service restaurant chains, drive-thru, franchise operators, and menu innovation." },
  { name: "FMCG", industryType: "FMCG", description: "Consumer packaged food and beverage companies, grocery, and retail channels." },
  { name: "Franchise", industryType: "RESTAURANT_CHAINS", description: "Franchise programs, franchisee economics, licensing, and territory development." },
  { name: "Marketing", industryType: "OTHER", description: "Campaigns, partnerships, loyalty, social media, and brand positioning." },
  { name: "Expansion", industryType: "OTHER", description: "International market entry, unit growth, market development, and new territories." },
  { name: "Investment", industryType: "OTHER", description: "M&A, private equity, IPO, strategic investment, and capital markets activity." },
  { name: "Supply Chain", industryType: "OTHER", description: "Ingredients, logistics, sourcing, packaging, commodities, and supplier risk." },
  { name: "Product Launches", industryType: "OTHER", description: "New menu items, packaged products, limited-time offers, and beverage launches." },
  { name: "Social Trends", industryType: "OTHER", description: "Viral products, consumer sentiment, creator-led trends, and platform analytics." },
  { name: "Funding", industryType: "OTHER", description: "Startup financing, growth rounds, debt, grants, and disclosed investor activity." },
  { name: "Consumer Trends", industryType: "OTHER", description: "Demand shifts, demographics, occasions, health, value, and premiumization trends." },
  { name: "Store Openings", industryType: "RESTAURANT_CHAINS", description: "New store openings, closures, relocations, and development milestones." },
] as const;

type BrandSeed = { name: string; industryType: string; category: string; aliases?: string[]; country?: string; websiteUrl?: string; description: string };

const brands: BrandSeed[] = [
  { name: "Mixue", industryType: "BUBBLE_TEA", category: "Bubble Tea", country: "China", aliases: ["MXBC", "Mixue Bingcheng", "蜜雪冰城"], websiteUrl: "https://www.mxbc.com/", description: "Chinese value-focused tea, ice cream, and beverage chain with rapid international expansion." },
  { name: "Chagee", industryType: "BUBBLE_TEA", category: "Bubble Tea", country: "China", aliases: ["霸王茶姬", "Ba Wang Cha Ji"], websiteUrl: "https://www.chagee.com/", description: "Modern Chinese tea chain focused on fresh milk tea and global expansion." },
  { name: "Heytea", industryType: "BUBBLE_TEA", category: "Bubble Tea", country: "China", aliases: ["HEYTEA", "喜茶"], websiteUrl: "https://www.heytea.com/", description: "Premium Chinese tea brand known for cheese tea and product innovation." },
  { name: "Nayuki", industryType: "BUBBLE_TEA", category: "Bubble Tea", country: "China", aliases: ["Nayuki's Tea", "奈雪的茶"], websiteUrl: "https://www.naixuecha.com/", description: "Chinese tea chain combining fruit tea, bakery, and experiential retail formats." },
  { name: "Gong cha", industryType: "BUBBLE_TEA", category: "Bubble Tea", country: "Taiwan", aliases: ["Gong Cha", "贡茶"], websiteUrl: "https://www.gongcha.com/", description: "International bubble tea franchise with a broad milk tea and toppings menu." },
  { name: "CoCo Fresh Tea & Juice", industryType: "BUBBLE_TEA", category: "Bubble Tea", country: "Taiwan", aliases: ["CoCo", "都可"], websiteUrl: "https://www.coco-tea.com/", description: "Taiwanese bubble tea and fresh juice chain with global franchise operations." },
  { name: "Tiger Sugar", industryType: "BUBBLE_TEA", category: "Bubble Tea", country: "Taiwan", aliases: ["老虎堂"], websiteUrl: "https://tigersugar.com/", description: "Bubble tea brand associated with brown sugar milk drinks and international franchising." },
  { name: "The Alley", industryType: "BUBBLE_TEA", category: "Bubble Tea", country: "Taiwan", aliases: ["鹿角巷"], websiteUrl: "https://www.the-alley.com/", description: "Design-led Taiwanese tea chain known for brown sugar drinks and premium positioning." },
  { name: "YiFang Taiwan Fruit Tea", industryType: "BUBBLE_TEA", category: "Bubble Tea", country: "Taiwan", aliases: ["YiFang", "一芳水果茶"], websiteUrl: "https://www.yifangtea.com/", description: "Taiwanese fruit tea chain focused on fruit-based tea drinks and franchising." },
  { name: "Starbucks", industryType: "COFFEE", category: "Coffee", country: "United States", aliases: ["Starbucks Coffee"], websiteUrl: "https://www.starbucks.com/", description: "Global coffeehouse chain and beverage retailer." },
  { name: "Luckin Coffee", industryType: "COFFEE", category: "Coffee", country: "China", aliases: ["瑞幸咖啡", "Luckin"], websiteUrl: "https://www.lkcoffee.com/", description: "Chinese coffee chain with app-led retail, value pricing, and aggressive store expansion." },
  { name: "Costa Coffee", industryType: "COFFEE", category: "Coffee", country: "United Kingdom", aliases: ["Costa"], websiteUrl: "https://www.costa.co.uk/", description: "UK-founded coffee chain owned by Coca-Cola with international operations." },
  { name: "Tim Hortons", industryType: "COFFEE", category: "Coffee", country: "Canada", aliases: ["Tims", "Tim's"], websiteUrl: "https://www.timhortons.com/", description: "Canadian coffee, bakery, and quick-service restaurant chain." },
  { name: "Dunkin'", industryType: "COFFEE", category: "Coffee", country: "United States", aliases: ["Dunkin", "Dunkin Donuts"], websiteUrl: "https://www.dunkindonuts.com/", description: "Coffee and bakery QSR chain with global franchise operations." },
  { name: "Peet's Coffee", industryType: "COFFEE", category: "Coffee", country: "United States", aliases: ["Peets Coffee", "Peet's"], websiteUrl: "https://www.peets.com/", description: "Specialty coffee roaster and cafe chain." },
  { name: "Blue Bottle Coffee", industryType: "COFFEE", category: "Coffee", country: "United States", aliases: ["Blue Bottle"], websiteUrl: "https://bluebottlecoffee.com/", description: "Specialty coffee brand and cafe operator with premium positioning." },
  { name: "Blank Street Coffee", industryType: "COFFEE", category: "Coffee", country: "United States", aliases: ["Blank Street"], websiteUrl: "https://www.blankstreet.com/", description: "Fast-growing coffee chain focused on compact stores and convenience-led formats." },
  { name: "McDonald's", industryType: "QSR", category: "QSR", country: "United States", aliases: ["McDonalds", "McDonald's Corporation"], websiteUrl: "https://www.mcdonalds.com/", description: "Global quick-service restaurant chain and franchisor." },
  { name: "KFC", industryType: "QSR", category: "QSR", country: "United States", aliases: ["Kentucky Fried Chicken"], websiteUrl: "https://www.kfc.com/", description: "Global fried chicken QSR brand operated by Yum! Brands." },
  { name: "Burger King", industryType: "QSR", category: "QSR", country: "United States", aliases: ["BK"], websiteUrl: "https://www.bk.com/", description: "Global burger QSR chain and franchisor." },
  { name: "Subway", industryType: "QSR", category: "QSR", country: "United States", aliases: ["Subway Restaurants"], websiteUrl: "https://www.subway.com/", description: "Global sandwich QSR chain with franchise-led operations." },
  { name: "Domino's", industryType: "QSR", category: "QSR", country: "United States", aliases: ["Dominos", "Domino's Pizza"], websiteUrl: "https://www.dominos.com/", description: "Global pizza delivery and carryout chain." },
  { name: "Pizza Hut", industryType: "QSR", category: "QSR", country: "United States", aliases: ["Pizza Hut Restaurants"], websiteUrl: "https://www.pizzahut.com/", description: "Pizza chain and franchisor operated by Yum! Brands." },
  { name: "Popeyes", industryType: "QSR", category: "QSR", country: "United States", aliases: ["Popeyes Louisiana Kitchen"], websiteUrl: "https://www.popeyes.com/", description: "Fried chicken QSR brand owned by Restaurant Brands International." },
  { name: "Jollibee", industryType: "QSR", category: "QSR", country: "Philippines", aliases: ["Jollibee Foods"], websiteUrl: "https://www.jollibee.com/", description: "Philippines-founded QSR chain with international expansion." },
  { name: "Chipotle", industryType: "RESTAURANT_CHAINS", category: "Restaurant Chains", country: "United States", aliases: ["Chipotle Mexican Grill"], websiteUrl: "https://www.chipotle.com/", description: "Fast-casual Mexican restaurant chain with digital and unit expansion focus." },
  { name: "Coca-Cola", industryType: "FMCG", category: "FMCG", country: "United States", aliases: ["The Coca-Cola Company", "Coke"], websiteUrl: "https://www.coca-colacompany.com/", description: "Global beverage company with soft drinks, water, sports drinks, coffee, and emerging categories." },
  { name: "PepsiCo", industryType: "FMCG", category: "FMCG", country: "United States", aliases: ["Pepsi"], websiteUrl: "https://www.pepsico.com/", description: "Global food and beverage company with snacks, beverages, and packaged brands." },
  { name: "Nestlé", industryType: "FMCG", category: "FMCG", country: "Switzerland", aliases: ["Nestle"], websiteUrl: "https://www.nestle.com/", description: "Global food, beverage, nutrition, and coffee company." },
  { name: "Unilever", industryType: "FMCG", category: "FMCG", country: "United Kingdom", aliases: ["Unilever PLC"], websiteUrl: "https://www.unilever.com/", description: "Global consumer goods company with food, refreshment, beauty, and home care brands." },
  { name: "Mondelez", industryType: "FMCG", category: "FMCG", country: "United States", aliases: ["Mondelez International", "Mondelēz"], websiteUrl: "https://www.mondelezinternational.com/", description: "Global snacks company with biscuits, chocolate, gum, candy, and baked snacks." },
  { name: "Danone", industryType: "FMCG", category: "FMCG", country: "France", aliases: ["Groupe Danone"], websiteUrl: "https://www.danone.com/", description: "Global food company focused on dairy, plant-based, waters, and specialized nutrition." },
  { name: "Kraft Heinz", industryType: "FMCG", category: "FMCG", country: "United States", aliases: ["The Kraft Heinz Company"], websiteUrl: "https://www.kraftheinzcompany.com/", description: "Global packaged food company with condiments, meals, sauces, and grocery brands." },
];

const rssSources = [
  { name: "Reuters Business via Google News", url: "https://news.google.com/rss/search?q=Reuters%20business%20food%20beverage%20restaurant&hl=en-US&gl=US&ceid=US:en", language: "EN", country: "United States", category: "FMCG", priority: 80, reliabilityScore: 0.92, fetchInterval: 30, notes: "Google News RSS query used because Reuters public RSS availability changes by market; verify licensing before production syndication." },
  { name: "CNBC Food & Beverage", url: "https://www.cnbc.com/id/10000108/device/rss/rss.html", language: "EN", country: "United States", category: "FMCG", priority: 70, reliabilityScore: 0.86, fetchInterval: 45, notes: "CNBC top news RSS; downstream filters should prioritize food, beverage, restaurant, and consumer terms." },
  { name: "Bloomberg Food via Google News", url: "https://news.google.com/rss/search?q=site%3Abloomberg.com%20food%20beverage%20restaurant%20retail&hl=en-US&gl=US&ceid=US:en", language: "EN", country: "United States", category: "FMCG", priority: 62, reliabilityScore: 0.84, fetchInterval: 60, notes: "Google News RSS query for Bloomberg coverage where official public RSS is not consistently available." },
  { name: "AP Food & Beverage via Google News", url: "https://news.google.com/rss/search?q=site%3Aapnews.com%20food%20beverage%20restaurant&hl=en-US&gl=US&ceid=US:en", language: "EN", country: "United States", category: "FMCG", priority: 60, reliabilityScore: 0.84, fetchInterval: 60, notes: "Google News RSS query for AP coverage where official public RSS is not consistently available." },
  { name: "QSR Magazine", url: "https://www.qsrmagazine.com/feed/", language: "EN", country: "United States", category: "QSR", priority: 95, reliabilityScore: 0.94, fetchInterval: 20, notes: "Specialist QSR and fast-casual source; high priority for restaurant-chain intelligence." },
  { name: "Nation's Restaurant News", url: "https://www.nrn.com/rss.xml", language: "EN", country: "United States", category: "Restaurant Chains", priority: 92, reliabilityScore: 0.92, fetchInterval: 30, notes: "Restaurant operator, menu, chain, franchise, and workforce coverage." },
  { name: "Restaurant Business", url: "https://www.restaurantbusinessonline.com/rss.xml", language: "EN", country: "United States", category: "Restaurant Chains", priority: 92, reliabilityScore: 0.92, fetchInterval: 30, notes: "Winsight restaurant industry coverage with chain and operator focus." },
  { name: "Restaurant Dive", url: "https://www.restaurantdive.com/feeds/news/", language: "EN", country: "United States", category: "Restaurant Chains", priority: 88, reliabilityScore: 0.9, fetchInterval: 30, notes: "Industry news on operators, digital, labor, marketing, and menu strategy." },
  { name: "Food Business News", url: "https://www.foodbusinessnews.net/rss", language: "EN", country: "United States", category: "FMCG", priority: 90, reliabilityScore: 0.93, fetchInterval: 30, notes: "Food manufacturing, CPG, ingredients, bakery, snacks, and beverage coverage." },
  { name: "Food Dive", url: "https://www.fooddive.com/feeds/news/", language: "EN", country: "United States", category: "FMCG", priority: 90, reliabilityScore: 0.91, fetchInterval: 30, notes: "CPG and food industry news with M&A, product, and regulatory coverage." },
  { name: "BeverageDaily", url: "https://www.beveragedaily.com/Info/Latest-News-RSS/All-News", language: "EN", country: "United Kingdom", category: "FMCG", priority: 88, reliabilityScore: 0.9, fetchInterval: 45, notes: "Beverage industry news including functional drinks, coffee, tea, alcohol, and packaging." },
  { name: "FoodNavigator", url: "https://www.foodnavigator.com/Info/Latest-News-RSS/All-News", language: "EN", country: "United Kingdom", category: "FMCG", priority: 86, reliabilityScore: 0.89, fetchInterval: 45, notes: "European and global food industry coverage, ingredients, regulation, nutrition, and retail." },
  { name: "Tea & Coffee Trade Journal", url: "https://www.teaandcoffee.net/feed/", language: "EN", country: "United Kingdom", category: "Tea", priority: 86, reliabilityScore: 0.88, fetchInterval: 60, notes: "Specialist tea and coffee trade publication." },
  { name: "World Tea News", url: "https://www.worldteanews.com/rss.xml", language: "EN", country: "United States", category: "Tea", priority: 84, reliabilityScore: 0.86, fetchInterval: 60, notes: "Tea sector news, events, trends, and producer/retailer coverage." },
  { name: "CPG Dive", url: "https://www.cpgdive.com/feeds/news/", language: "EN", country: "United States", category: "FMCG", priority: 88, reliabilityScore: 0.9, fetchInterval: 30, notes: "Consumer packaged goods news including packaged food, beverage, and retail brands." },
  { name: "Grocery Dive", url: "https://www.grocerydive.com/feeds/news/", language: "EN", country: "United States", category: "FMCG", priority: 80, reliabilityScore: 0.87, fetchInterval: 45, notes: "Grocery retail and channel intelligence relevant to packaged food and beverage." },
  { name: "Packaging Dive", url: "https://www.packagingdive.com/feeds/news/", language: "EN", country: "United States", category: "Supply Chain", priority: 72, reliabilityScore: 0.85, fetchInterval: 60, notes: "Packaging, sustainability, and supplier signals for FMCG and beverage brands." },
  { name: "Just Food", url: "https://www.just-food.com/feed/", language: "EN", country: "United Kingdom", category: "FMCG", priority: 78, reliabilityScore: 0.86, fetchInterval: 60, notes: "Global food manufacturing, CPG strategy, and supply chain news." },
  { name: "36Kr Food & Consumer", url: "https://rsshub.app/36kr/newsflashes", language: "ZH", country: "China", category: "Investment", priority: 82, reliabilityScore: 0.83, fetchInterval: 30, notes: "RSSHub route for Chinese tech, consumer, and funding signals; filter for food, beverage, tea, coffee, restaurants." },
  { name: "Jiemian Food & Beverage", url: "https://rsshub.app/jiemian/lists/59", language: "ZH", country: "China", category: "FMCG", priority: 84, reliabilityScore: 0.84, fetchInterval: 45, notes: "RSSHub route; validate section route periodically as Chinese media site routes can change." },
  { name: "Huxiu Consumer", url: "https://rsshub.app/huxiu/article", language: "ZH", country: "China", category: "Consumer Trends", priority: 76, reliabilityScore: 0.8, fetchInterval: 60, notes: "RSSHub route for Chinese business commentary and consumer-sector analysis." },
  { name: "Hongcan Restaurant News", url: "https://rsshub.app/hongcan/news", language: "ZH", country: "China", category: "Restaurant Chains", priority: 78, reliabilityScore: 0.78, fetchInterval: 60, notes: "RSSHub route for Chinese restaurant industry coverage; review route health after deployment." },
  { name: "CanYin88 Restaurant News", url: "https://rsshub.app/canyin88/news", language: "ZH", country: "China", category: "Restaurant Chains", priority: 76, reliabilityScore: 0.76, fetchInterval: 60, notes: "RSSHub route for Chinese restaurant and catering industry news." },
  { name: "EqualOcean Food & Consumer", url: "https://equalocean.com/feed", language: "EN", country: "China", category: "Expansion", priority: 74, reliabilityScore: 0.8, fetchInterval: 60, notes: "China-focused business source useful for outbound brand, funding, and expansion signals." },
] as const;

const tags = [
  "IPO", "M&A", "Franchise", "International Expansion", "Store Opening", "Menu Innovation", "Limited-Time Offer", "Supply Chain", "Commodity Prices", "Packaging", "Sustainability", "Private Equity", "Funding Round", "Digital Ordering", "Loyalty", "Delivery", "Coffee", "Tea", "Bubble Tea", "QSR", "FMCG", "China Market", "US Market", "Middle East", "Southeast Asia", "Product Launch", "Consumer Trends", "Social Viral", "Ingredient Innovation", "Ready-to-Drink",
];

async function main() {
  validateSeedData();

  console.info("Seeding roles...");
  const roleRecords = new Map<string, { id: string }>();
  for (const role of roles) {
    const record = await prisma.role.upsert({
      where: { name: role.name as any },
      create: { name: role.name as any, description: role.description, permissions: role.permissions },
      update: { description: role.description, permissions: role.permissions },
      select: { id: true },
    });
    roleRecords.set(role.name, record);
  }

  console.info("Seeding admin placeholder...");
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    create: { email: ADMIN_EMAIL, name: "GFBI Admin Placeholder", role: "SUPER_ADMIN" as any, roleId: roleRecords.get("SUPER_ADMIN")?.id, locale: "EN" as any, timezone: "UTC", isActive: true },
    update: { role: "SUPER_ADMIN" as any, roleId: roleRecords.get("SUPER_ADMIN")?.id, isActive: true },
  });

  console.info("Seeding countries...");
  const countryRecords = new Map<string, { id: string }>();
  for (const country of countries) {
    const record = await prisma.country.upsert({
      where: { slug: slugify(country.name) },
      create: { ...country, slug: slugify(country.name), defaultLanguage: country.defaultLanguage as any, isActive: true },
      update: { ...country, defaultLanguage: country.defaultLanguage as any, isActive: true },
      select: { id: true },
    });
    countryRecords.set(country.name, record);
  }

  console.info("Seeding categories...");
  const categoryRecords = new Map<string, { id: string }>();
  for (const category of categories) {
    const record = await prisma.category.upsert({
      where: { slug: slugify(category.name) },
      create: { ...category, slug: slugify(category.name), industryType: category.industryType as any },
      update: { description: category.description, industryType: category.industryType as any },
      select: { id: true },
    });
    categoryRecords.set(category.name, record);
  }

  console.info("Seeding tags...");
  for (const tag of tags) {
    const categoryName = ["Coffee", "Tea", "Bubble Tea", "QSR", "FMCG"].includes(tag) ? tag : undefined;
    await prisma.tag.upsert({
      where: { slug: slugify(tag) },
      create: { name: tag, slug: slugify(tag), categoryId: categoryName ? categoryRecords.get(categoryName)?.id : undefined },
      update: { name: tag, categoryId: categoryName ? categoryRecords.get(categoryName)?.id : undefined },
    });
  }

  console.info("Seeding brands...");
  for (const brand of brands) {
    const country = brand.country ? countryRecords.get(brand.country) : undefined;
    const category = categoryRecords.get(brand.category);
    await prisma.brand.upsert({
      where: { slug: slugify(brand.name) },
      create: {
        name: brand.name,
        slug: slugify(brand.name),
        aliases: brand.aliases ?? [],
        description: brand.description,
        websiteUrl: brand.websiteUrl,
        headquartersCountryId: country?.id,
        categoryId: category?.id,
        industryType: brand.industryType as any,
      },
      update: {
        aliases: brand.aliases ?? [],
        description: brand.description,
        websiteUrl: brand.websiteUrl,
        headquartersCountryId: country?.id ?? null,
        categoryId: category?.id ?? null,
        industryType: brand.industryType as any,
      },
    });
  }

  console.info("Seeding RSS sources...");
  for (const source of rssSources) {
    const country = countryRecords.get(source.country);
    const category = categoryRecords.get(source.category);
    await prisma.source.upsert({
      where: { slug: slugify(source.name) },
      create: {
        name: source.name,
        slug: slugify(source.name),
        url: source.url,
        feedUrl: source.url,
        language: source.language as any,
        countryId: country?.id,
        categoryId: category?.id,
        industryType: categories.find((categoryItem) => categoryItem.name === source.category)?.industryType as any,
        active: true,
        isActive: true,
        priority: source.priority,
        trustScore: source.reliabilityScore,
        reliabilityScore: source.reliabilityScore,
        crawlInterval: source.fetchInterval,
        notes: source.notes,
      } as any,
      update: {
        url: source.url,
        feedUrl: source.url,
        language: source.language as any,
        countryId: country?.id ?? null,
        categoryId: category?.id ?? null,
        industryType: categories.find((categoryItem) => categoryItem.name === source.category)?.industryType as any,
        active: true,
        isActive: true,
        priority: source.priority,
        trustScore: source.reliabilityScore,
        reliabilityScore: source.reliabilityScore,
        crawlInterval: source.fetchInterval,
        notes: source.notes,
      } as any,
    });
  }

  console.info("Seeding sample reports...");
  const marketCategory = categoryRecords.get("Bubble Tea");
  await prisma.marketReport.upsert({
    where: { slug: "global-bubble-tea-expansion-watch" },
    create: {
      title: "Global Bubble Tea Expansion Watch",
      slug: "global-bubble-tea-expansion-watch",
      language: "EN" as any,
      summary: "Starter report tracking international store growth, franchise signals, and product innovation across major bubble tea brands.",
      body: "Use this sample report as a placeholder for the daily AI-generated intelligence workflow. Replace with analyst-reviewed content before public launch.",
      industryType: "BUBBLE_TEA" as any,
      categoryId: marketCategory?.id,
      publishedAt: NOW,
      aiModel: "seed",
      metrics: { seeded: true, sourceCount: rssSources.length, brandCount: brands.length },
    },
    update: { summary: "Starter report tracking international store growth, franchise signals, and product innovation across major bubble tea brands.", publishedAt: NOW, metrics: { seeded: true, sourceCount: rssSources.length, brandCount: brands.length } },
  });

  await prisma.dailyReport.upsert({
    where: { slug: "daily-food-beverage-intelligence-brief-seed" },
    create: {
      title: "Daily Food & Beverage Intelligence Brief",
      slug: "daily-food-beverage-intelligence-brief-seed",
      language: "EN" as any,
      summary: "Seeded daily report placeholder for validating report pages and sitemap generation.",
      body: "Replace this seeded brief with generated daily intelligence after cron jobs are enabled.",
      industryType: "OTHER" as any,
      reportDate: new Date("2026-06-03T00:00:00.000Z"),
      publishedAt: NOW,
      aiModel: "seed",
      metrics: { seeded: true },
    },
    update: { summary: "Seeded daily report placeholder for validating report pages and sitemap generation.", publishedAt: NOW, metrics: { seeded: true } },
  });

  console.info("Seeding sample news...");
  const source = await prisma.source.findUnique({ where: { slug: "qsr-magazine" }, select: { id: true } });
  const qsrCategory = categoryRecords.get("QSR");
  const usa = countryRecords.get("United States");
  const mcdonalds = await prisma.brand.findUnique({ where: { slug: "mcdonald-s" }, select: { id: true } });
  const sampleUrl = "https://example.com/gfbi/sample-qsr-expansion-intelligence";
  const sampleNews = await prisma.news.upsert({
    where: { slug: "sample-qsr-expansion-intelligence" },
    create: {
      sourceId: source?.id,
      categoryId: qsrCategory?.id,
      primaryCountryId: usa?.id,
      primaryBrandId: mcdonalds?.id,
      title: "Sample QSR expansion intelligence item",
      slug: "sample-qsr-expansion-intelligence",
      canonicalUrl: sampleUrl,
      originalUrl: sampleUrl,
      urlHash: hash(sampleUrl),
      contentHash: hash("sample-qsr-expansion-intelligence"),
      excerpt: "A seeded article used to verify public cards, search, tagging, and AI review flows.",
      body: "This sample article is safe to delete after real RSS ingestion is enabled.",
      language: "EN" as any,
      status: "PUBLISHED" as any,
      industryType: "QSR" as any,
      publishedAt: NOW,
      aiSummary: "Seeded sample article for validating the Global Food & Beverage Intelligence UI and search workflows.",
      aiReviewStatus: "approved",
      aiConfidenceScore: 0.99,
      aiKeywords: ["QSR", "Expansion", "Seed"],
    },
    update: { status: "PUBLISHED" as any, publishedAt: NOW, aiReviewStatus: "approved", aiConfidenceScore: 0.99 },
    select: { id: true },
  });

  await prisma.newsTranslation.upsert({
    where: { newsId_language: { newsId: sampleNews.id, language: "ZH" as any } },
    create: { newsId: sampleNews.id, language: "ZH" as any, title: "示例快餐扩张情报", slug: "sample-qsr-expansion-intelligence-zh", excerpt: "用于验证公开页面、搜索、标签和 AI 审核流程的种子文章。", aiSummary: "用于验证 Global Food & Beverage Intelligence 的种子文章。", reviewStatus: "approved", translatedAt: NOW, qualityScore: 0.99 },
    update: { title: "示例快餐扩张情报", excerpt: "用于验证公开页面、搜索、标签和 AI 审核流程的种子文章。", aiSummary: "用于验证 Global Food & Beverage Intelligence 的种子文章。", reviewStatus: "approved", translatedAt: NOW, qualityScore: 0.99 },
  });

  console.info("Seed complete", { roles: roles.length, countries: countries.length, categories: categories.length, brands: brands.length, rssSources: rssSources.length, tags: tags.length });
}

function validateSeedData() {
  assertUnique(countries as unknown as typeof countries[number][], (country) => slugify(country.name), "Country slugs");
  assertUnique(categories as unknown as typeof categories[number][], (category) => slugify(category.name), "Category slugs");
  assertUnique(brands, (brand) => slugify(brand.name), "Brand slugs");
  assertUnique(rssSources as unknown as typeof rssSources[number][], (source) => slugify(source.name), "Source slugs");
  assertUnique(rssSources as unknown as typeof rssSources[number][], (source) => source.url, "Source URLs");
  assertUnique(tags, (tag) => slugify(tag), "Tag slugs");

  const aliasOwners = new Map<string, string>();
  for (const brand of brands) {
    for (const alias of brand.aliases ?? []) {
      const normalized = alias.trim().toLowerCase();
      const owner = aliasOwners.get(normalized);
      if (owner) throw new Error(`Brand alias must be unique: "${alias}" is used by ${owner} and ${brand.name}`);
      aliasOwners.set(normalized, brand.name);
    }
  }

  const countryNames = new Set<string>(countries.map((country) => country.name));
  const categoryNames = new Set<string>(categories.map((category) => category.name));
  for (const brand of brands) {
    if (brand.country && !countryNames.has(brand.country)) throw new Error(`Brand ${brand.name} references missing country ${brand.country}`);
    if (!categoryNames.has(brand.category)) throw new Error(`Brand ${brand.name} references missing category ${brand.category}`);
    if (brand.websiteUrl) assertUrl(brand.websiteUrl, `${brand.name} websiteUrl`);
  }
  for (const source of rssSources) {
    assertUrl(source.url, `${source.name} url`);
    if (!countryNames.has(source.country)) throw new Error(`Source ${source.name} references missing country ${source.country}`);
    if (!categoryNames.has(source.category)) throw new Error(`Source ${source.name} references missing category ${source.category}`);
    if (source.priority < 0 || source.priority > 100) throw new Error(`Source ${source.name} priority must be 0-100`);
    if (source.reliabilityScore < 0 || source.reliabilityScore > 1) throw new Error(`Source ${source.name} reliabilityScore must be 0-1`);
    if (source.fetchInterval < 5) throw new Error(`Source ${source.name} fetchInterval must be at least 5 minutes`);
  }
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
