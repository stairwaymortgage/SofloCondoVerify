import { getTriCountyBuildingIndex } from "@/lib/buildings";
import { urlSet, xmlResponse, type SitemapEntry } from "@/lib/sitemap";

export const revalidate = 3600;

/** Every tri-county record, plus the due-diligence read where one exists. */
export async function GET() {
  const buildings = await getTriCountyBuildingIndex();

  const entries: SitemapEntry[] = [];
  for (const building of buildings) {
    entries.push({ path: `/building/${building.id}` });
    if (building.flagged) entries.push({ path: `/building/${building.id}/risk` });
  }

  return xmlResponse(urlSet(entries));
}
