export const regions = {
  "Southeast Asia": ["Indonesia", "Malaysia", "Vietnam", "Thailand", "Philippines", "Cambodia", "Singapore"],
  "East Asia": ["China", "Japan", "South Korea", "Hong Kong", "Taiwan"],
  "South Asia": ["India", "Pakistan", "Bangladesh", "Sri Lanka"],
  "Middle East": ["UAE", "Saudi Arabia", "Qatar", "Kuwait", "Egypt", "Turkey"],
  Europe: ["United Kingdom", "France", "Germany", "Italy", "Spain", "Netherlands"],
  "North America": ["United States", "Canada", "Mexico"],
  "South America": ["Brazil", "Argentina", "Chile", "Colombia"],
  Africa: ["South Africa", "Kenya", "Nigeria", "Morocco"],
  Oceania: ["Australia", "New Zealand"]
};

export const categories = ["Tea", "Coffee", "Fried Chicken", "Burger", "Snack", "Bakery", "Ice Cream", "Dessert"];

export const platforms = [
  "TikTok",
  "Instagram",
  "Facebook",
  "YouTube",
  "X",
  "LinkedIn",
  "Xiaohongshu",
  "Weibo",
  "Threads",
  "Pinterest",
  "Telegram",
  "Discord",
  "Snapchat"
];

export const brands = [
  "Heytea",
  "CHAGEE",
  "Mixue",
  "Nayuki",
  "Ai-CHA",
  "Gong Cha",
  "KOI",
  "Sharetea",
  "Chatime",
  "Starbucks",
  "Luckin Coffee",
  "Tim Hortons",
  "KFC",
  "Popeyes",
  "Jollibee",
  "Texas Chicken",
  "Korean Fried Chicken",
  "Auntie Anne's",
  "Potato Corner",
  "Local Snack Chains"
];

const allCountries = Object.entries(regions).flatMap(([region, countries]) =>
  countries.map((country, index) => ({
    country,
    region,
    news: 28 + index * 7 + region.length,
    socialHeat: 54 + ((index * 9 + region.length) % 43),
    marketHeat: 48 + ((index * 13 + region.length) % 45),
    trend: categories[(index + region.length) % categories.length],
    topBrand: brands[(index + region.length) % brands.length]
  }))
);

export function createIntelligenceData() {
  const countryData = allCountries
    .map((item, index) => ({ ...item, rank: index + 1 }))
    .sort((a, b) => b.marketHeat - a.marketHeat);

  const platformData = platforms.map((platform, index) => ({
    platform,
    followers: 180000 + index * 84000,
    views: 1200000 + index * 620000,
    reach: 760000 + index * 410000,
    engagement: 3.8 + (index % 6) * 0.7,
    trendingPosts: 18 + index * 3,
    hashtags: ["#milktea", "#qsr", "#foodtok", "#snackchain", "#franchise"].slice(0, 3 + (index % 3)),
    growth: [22, 28, 31, 38, 44, 41, 52, 59, 63, 70, 76, 82].map((value) => value + index * 3)
  }));

  const brandData = brands.map((brand, index) => ({
    brand,
    category: index < 9 ? "Tea" : index < 12 ? "Coffee" : index < 17 ? "Fried Chicken" : "Snack",
    newsHeat: 42 + ((index * 11) % 55),
    socialHeat: 48 + ((index * 17) % 49),
    expansion: ["SEA franchise push", "Middle East store pipeline", "US creator campaign", "EU flagship scouting"][index % 4],
    campaign: ["New menu launch", "Creator seeding", "Store design refresh", "Holiday combo"][index % 4],
    tiktok: 240000 + index * 43000,
    instagram: 160000 + index * 31000
  }));

  const news = Array.from({ length: 12 }, (_, index) => ({
    title: [
      "Bubble tea chains accelerate Southeast Asia store openings",
      "QSR brands test AI menu boards for higher conversion",
      "Coffee chains move deeper into drive-thru and delivery",
      "Fried chicken challengers expand with spicy limited menus",
      "Snack chains use creator-led launches to enter malls",
      "Bakery and dessert brands win with premium gifting formats"
    ][index % 6],
    source: ["Google News", "RSS", "Reddit", "Global F&B Media", "Google Trends"][index % 5],
    category: categories[index % categories.length],
    country: countryData[index % countryData.length].country,
    heat: 58 + index * 3,
    sentiment: ["Positive", "Neutral", "Watch"][index % 3],
    time: `${index + 1}h ago`
  }));

  const trendSeries = [36, 42, 47, 51, 59, 66, 64, 73, 79, 86, 92, 101];
  const socialSeries = [28, 34, 31, 49, 56, 62, 71, 69, 84, 91, 97, 114];

  return {
    countryData,
    platformData,
    brandData,
    news,
    trendSeries,
    socialSeries,
    heatmap: countryData.slice(0, 42),
    tiktokTrends: [
      "Cheese foam tea comeback",
      "Spicy Korean fried chicken boxes",
      "Mini snack kiosk format",
      "AI menu recommendation clips",
      "Black-and-white flagship store design",
      "Creator blind tasting battles",
      "Limited mango coconut drinks",
      "Viral queue opening videos"
    ],
    aiInsights: [
      "Tea and snack brands are converging around mall kiosks, creator tasting content and premium visual systems.",
      "Southeast Asia shows the strongest near-term signal for franchise-led expansion across tea, coffee and chicken.",
      "TikTok velocity is highest when store design, menu novelty and short creator reactions appear in the same asset.",
      "AI-generated daily reports should prioritize market entry signals, brand expansion, menu launches and viral formats."
    ]
  };
}
