import { supabase } from "./supabase";
import type { Building } from "./database.types";

/** A single building record, or null for a bad id / missing row. */
export async function getBuilding(rawId: string): Promise<Building | null> {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) return null;

  const { data, error } = await supabase
    .from("buildings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[buildings]", error.message);
    return null;
  }
  return data as Building | null;
}

/**
 * The priority set — tri-county buildings with two or more flagged signals.
 * These are the pages worth prebuilding: they carry the due-diligence read and
 * they are what search traffic lands on. Everything else renders on demand.
 */
export async function getPriorityBuildingIds(): Promise<number[]> {
  const { data, error } = await supabase
    .from("buildings")
    .select("id")
    .eq("tri_county", "Yes")
    .gte("signal_count", 2)
    .order("id");

  if (error) {
    console.error("[buildings/priority]", error.message);
    return [];
  }
  return (data ?? []).map((row) => row.id);
}
