/**
 * Bulk-loads data/buildings.csv into the Supabase `buildings` table.
 *
 *   npm run load:buildings              # refuses to run if the table has rows
 *   npm run load:buildings -- --force   # wipes the table first, then reloads
 *
 * Uses the service-role admin client, so it bypasses RLS. Server-side only.
 */

import { config } from "dotenv";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import type { BuildingInsert } from "../lib/database.types";

config({ path: ".env.local" });

const CSV_PATH = path.join(process.cwd(), "data", "buildings.csv");
const BATCH_SIZE = 500;

/** Columns that must be inserted as integers rather than text. */
const INT_COLUMNS = [
  "signal_count",
  "sb4d_bldgs_3plus",
  "sb4d_units",
  "recert_year",
] as const;

const TEXT_COLUMNS = [
  "building_name",
  "county",
  "city",
  "zip",
  "address",
  "tri_county",
  "signals",
  "fha_status",
  "fha_method",
  "fha_exp",
  "va_status",
  "va_date",
  "conv_review",
  "conv_date",
  "sb4d",
  "sirs_filed",
  "registry_status",
  "registry_enf",
  "recert_status",
  "precon",
  "precon_status",
] as const;

type CsvRow = Record<string, string>;

function toText(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toInt(value: string | undefined): number | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const parsed = Number.parseInt(trimmed.replace(/,/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function toBuilding(row: CsvRow): BuildingInsert {
  const building = {} as Record<string, string | number | null>;
  for (const column of TEXT_COLUMNS) building[column] = toText(row[column]);
  for (const column of INT_COLUMNS) building[column] = toInt(row[column]);
  return building as unknown as BuildingInsert;
}

async function main() {
  const force = process.argv.includes("--force");

  // Imported lazily so dotenv has already populated process.env.
  const { createAdminClient } = await import("../lib/supabase");
  const admin = createAdminClient();

  console.log(`Reading ${CSV_PATH} …`);
  const csv = readFileSync(CSV_PATH, "utf8");
  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: false,
    relax_column_count: true,
  }) as CsvRow[];

  const missing = [...TEXT_COLUMNS, ...INT_COLUMNS].filter(
    (column) => !(column in (rows[0] ?? {}))
  );
  if (missing.length) {
    throw new Error(`CSV is missing expected columns: ${missing.join(", ")}`);
  }

  const buildings = rows.map(toBuilding);
  console.log(`Parsed ${buildings.length.toLocaleString()} rows from CSV.`);

  const { count: existing, error: countError } = await admin
    .from("buildings")
    .select("*", { count: "exact", head: true });
  if (countError) throw countError;

  if (existing && existing > 0) {
    if (!force) {
      throw new Error(
        `buildings already holds ${existing.toLocaleString()} rows. ` +
          `Re-run with --force to wipe and reload.`
      );
    }
    console.log(`--force: deleting ${existing.toLocaleString()} existing rows …`);
    const { error: deleteError } = await admin
      .from("buildings")
      .delete()
      .gt("id", 0);
    if (deleteError) throw deleteError;
  }

  const totalBatches = Math.ceil(buildings.length / BATCH_SIZE);
  let inserted = 0;

  for (let i = 0; i < buildings.length; i += BATCH_SIZE) {
    const batch = buildings.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

    const { error } = await admin.from("buildings").insert(batch);
    if (error) {
      throw new Error(
        `Batch ${batchNumber}/${totalBatches} (rows ${i + 1}–${
          i + batch.length
        }) failed: ${error.message}`
      );
    }

    inserted += batch.length;
    const pct = Math.round((inserted / buildings.length) * 100);
    console.log(
      `  batch ${String(batchNumber).padStart(2, " ")}/${totalBatches} · ` +
        `${inserted.toLocaleString()}/${buildings.length.toLocaleString()} rows (${pct}%)`
    );
  }

  const { count: finalCount, error: finalError } = await admin
    .from("buildings")
    .select("*", { count: "exact", head: true });
  if (finalError) throw finalError;

  console.log(`\nDone. buildings now holds ${finalCount?.toLocaleString()} rows.`);
  if (finalCount !== buildings.length) {
    throw new Error(
      `Row count mismatch: expected ${buildings.length}, found ${finalCount}.`
    );
  }
}

main().catch((error: unknown) => {
  console.error(`\nLoad failed: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
