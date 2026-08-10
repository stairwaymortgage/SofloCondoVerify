import { COUNTIES, cityHubHref, getCityHubs } from "@/lib/cities";
import { urlSet, xmlResponse, type SitemapEntry } from "@/lib/sitemap";

export const revalidate = 3600;

/** Home, the three county hubs, and every city hub. */
export async function GET() {
  const hubs = await getCityHubs();

  const entries: SitemapEntry[] = [
    { path: "/" },
    ...COUNTIES.map((county) => ({ path: `/condos/${county.slug}` })),
    ...hubs
      .map((hub) => cityHubHref(hub))
      .filter((href): href is string => href !== null)
      .map((path) => ({ path })),
  ];

  return xmlResponse(urlSet(entries));
}
