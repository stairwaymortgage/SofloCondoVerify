import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/schema";

/**
 * Records are the product — everything that is a record stays crawlable, and
 * the index points at the segmented sitemaps.
 *
 * Only /api/ is disallowed. The utility pages we want out of the index
 * (/connect, /privacy) carry a `noindex` meta tag instead, deliberately:
 * a Disallow rule stops the crawl before the tag is ever read, so a page that
 * is linked from every record — which /connect is — can still surface as a
 * bare URL result. Blocking and noindexing the same path is the one
 * combination that reliably fails. Crawl it, then drop it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: siteUrl("/sitemap.xml"),
    host: siteUrl("/").replace(/\/$/, ""),
  };
}
