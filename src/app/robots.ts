import type { MetadataRoute } from "next";
import { absoluteUrl, baseUrl } from "../features/public/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/", "/news", "/brands", "/countries", "/categories", "/reports", "/search"], disallow: ["/admin", "/auth", "/api"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: baseUrl,
  };
}
