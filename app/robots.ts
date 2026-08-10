import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/schema";

/** Everything is crawlable; the index points at the segmented sitemaps. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: siteUrl("/sitemap.xml"),
  };
}
