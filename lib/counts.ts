import { supabase } from "./supabase";

/** Fallback if the count query fails — the last known tri-county total. */
const FALLBACK_TRI_COUNTY = 8718;

/**
 * How many buildings the site actually lets you browse. Statewide rows are
 * loaded but filtered out of search, so this is the tri-county subset.
 */
export async function getTriCountyBuildingCount(): Promise<number> {
  const { count, error } = await supabase
    .from("buildings")
    .select("*", { count: "exact", head: true })
    .eq("tri_county", "Yes");

  if (error || count === null) {
    if (error) console.error("[counts]", error.message);
    return FALLBACK_TRI_COUNTY;
  }
  return count;
}
