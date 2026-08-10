import { sitemapIndex, xmlResponse } from "@/lib/sitemap";

export const revalidate = 3600;

/** Segmented per page type so a refresh of one doesn't churn the others. */
export function GET() {
  return xmlResponse(
    sitemapIndex([
      "/sitemap-cities.xml",
      "/sitemap-faq.xml",
      "/sitemap-buildings.xml",
      "/sitemap-precon.xml",
      "/sitemap-developers.xml",
    ])
  );
}
