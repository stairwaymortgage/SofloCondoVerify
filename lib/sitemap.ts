import { siteUrl } from "./schema";

/** Shared XML plumbing for the segmented sitemaps. */

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface SitemapEntry {
  path: string;
  /** ISO date, when we have a meaningful one. */
  lastModified?: string | null;
}

export function urlSet(entries: SitemapEntry[]): string {
  const urls = entries
    .map((entry) => {
      const loc = `    <loc>${escapeXml(siteUrl(entry.path))}</loc>`;
      const lastmod = entry.lastModified
        ? `\n    <lastmod>${escapeXml(entry.lastModified)}</lastmod>`
        : "";
      return `  <url>\n${loc}${lastmod}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function sitemapIndex(paths: string[]): string {
  const maps = paths
    .map((path) => `  <sitemap>\n    <loc>${escapeXml(siteUrl(path))}</loc>\n  </sitemap>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${maps}\n</sitemapindex>\n`;
}

export function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
