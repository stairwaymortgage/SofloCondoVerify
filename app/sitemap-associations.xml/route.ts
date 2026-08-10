import { associationHref, getAssociations, groupByCity } from "@/lib/associations";
import { urlSet, xmlResponse, type SitemapEntry } from "@/lib/sitemap";

export const revalidate = 3600;

/** Registry index, one page per city, and every entry whose city resolved. */
export async function GET() {
  const associations = await getAssociations();
  const cities = groupByCity(associations);

  const entries: SitemapEntry[] = [
    { path: "/associations" },
    ...cities.map((city) => ({ path: `/associations/${city.segment}` })),
    ...associations
      .map((association) => associationHref(association))
      .filter((href): href is string => href !== null)
      .map((path) => ({ path })),
  ];

  return xmlResponse(urlSet(entries));
}
