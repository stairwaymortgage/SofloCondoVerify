/**
 * Bulk-loads the 20 workbook CSVs in data/ into their Supabase tables.
 *
 *   npm run load:workbooks                    # all tables; skips non-empty ones
 *   npm run load:workbooks -- --force         # wipe and reload every table
 *   npm run load:workbooks -- --only=faq,people
 *   npm run load:workbooks -- --sql           # print the migration DDL, load nothing
 *
 * Uses the service-role admin client, so it bypasses RLS. Server-side only.
 */

import { config } from "dotenv";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { WORKBOOKS, buildMigrationSql, csvHeader, type WorkbookSpec } from "./workbooks";

config({ path: ".env.local" });

const BATCH_SIZE = 500;
const DATA_DIR = path.join(process.cwd(), "data");

type CsvRow = Record<string, string>;
type Value = string | number | null;

/** Tracks values that were present in the CSV but couldn't be parsed. */
interface Coercion {
  column: string;
  samples: string[];
  count: number;
}

function toText(value: string | undefined): Value {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Handles "40,242" and the "~3,093" approximate markers in city_hubs. */
function toInt(value: string | undefined): { value: Value; failed: boolean } {
  const raw = value?.trim();
  if (!raw) return { value: null, failed: false };
  const cleaned = raw.replace(/[,~\s]/g, "");
  const parsed = Number.parseInt(cleaned, 10);
  if (!Number.isFinite(parsed)) return { value: null, failed: true };
  return { value: parsed, failed: !/^-?\d+$/.test(cleaned) };
}

function toNumeric(value: string | undefined): { value: Value; failed: boolean } {
  const raw = value?.trim();
  if (!raw) return { value: null, failed: false };
  const cleaned = raw.replace(/[,\s]/g, "");
  const parsed = Number.parseFloat(cleaned);
  if (!Number.isFinite(parsed)) return { value: null, failed: true };
  return { value: parsed, failed: !/^-?\d*\.?\d+$/.test(cleaned) };
}

function mapRows(spec: WorkbookSpec, rows: CsvRow[]) {
  const coercions = new Map<string, Coercion>();

  const mapped = rows.map((row) => {
    const record: Record<string, Value> = {};

    for (const [column, type] of Object.entries(spec.columns)) {
      const source = row[csvHeader(spec, column)];

      if (type === "text") {
        record[column] = toText(source);
        continue;
      }

      const result = type === "integer" ? toInt(source) : toNumeric(source);
      record[column] = result.value;

      if (result.failed && source?.trim()) {
        const entry = coercions.get(column) ?? { column, samples: [], count: 0 };
        entry.count += 1;
        if (entry.samples.length < 3) entry.samples.push(source.trim());
        coercions.set(column, entry);
      }
    }

    return record;
  });

  return { mapped, coercions: [...coercions.values()] };
}

async function loadOne(
  admin: Awaited<ReturnType<typeof getAdmin>>,
  spec: WorkbookSpec,
  force: boolean
): Promise<{ table: string; loaded: number; expected: number; skipped: boolean }> {
  const file = path.join(DATA_DIR, spec.file);
  const rows = parse(readFileSync(file, "utf8"), {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    relax_column_count: true,
  }) as CsvRow[];

  // Fail loudly rather than inserting a table full of nulls.
  const headers = Object.keys(rows[0] ?? {});
  const missing = Object.keys(spec.columns)
    .map((column) => csvHeader(spec, column))
    .filter((header) => !headers.includes(header));
  if (missing.length) {
    throw new Error(`${spec.file} is missing columns: ${missing.join(", ")}`);
  }

  const { mapped, coercions } = mapRows(spec, rows);

  const { count: existing, error: countError } = await admin
    .from(spec.table)
    .select("*", { count: "exact", head: true });
  if (countError) throw new Error(`${spec.table}: ${countError.message}`);

  if (existing && existing > 0) {
    if (!force) {
      console.log(
        `  ${spec.table.padEnd(20)} skipped — already holds ${existing.toLocaleString()} rows (use --force)`
      );
      return { table: spec.table, loaded: existing, expected: spec.expected, skipped: true };
    }
    const { error } = await admin.from(spec.table).delete().gt("id", 0);
    if (error) throw new Error(`${spec.table} wipe failed: ${error.message}`);
  }

  let inserted = 0;
  const batches = Math.ceil(mapped.length / BATCH_SIZE);

  for (let i = 0; i < mapped.length; i += BATCH_SIZE) {
    const batch = mapped.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

    const { error } = await admin.from(spec.table).insert(batch);
    if (error) {
      throw new Error(
        `${spec.table} batch ${batchNumber}/${batches} (rows ${i + 1}–${i + batch.length}) failed: ${error.message}`
      );
    }
    inserted += batch.length;
    if (batches > 1) {
      process.stdout.write(
        `\r  ${spec.table.padEnd(20)} ${inserted.toLocaleString()}/${mapped.length.toLocaleString()} (batch ${batchNumber}/${batches})   `
      );
    }
  }

  const { count: final, error: finalError } = await admin
    .from(spec.table)
    .select("*", { count: "exact", head: true });
  if (finalError) throw new Error(`${spec.table}: ${finalError.message}`);

  const ok = final === spec.expected;
  process.stdout.write(
    `\r  ${spec.table.padEnd(20)} ${String(final).padStart(6)} rows  ` +
      `${ok ? "OK" : `MISMATCH (expected ${spec.expected})`}` +
      `${spec.gated ? "  [gated]" : ""}\n`
  );

  if (spec.note) console.log(`      note: ${spec.note}`);
  for (const c of coercions) {
    console.log(
      `      warn: ${c.column} — ${c.count} value(s) not cleanly numeric, e.g. ${JSON.stringify(c.samples)}`
    );
  }

  return { table: spec.table, loaded: final ?? 0, expected: spec.expected, skipped: false };
}

async function getAdmin() {
  const { createAdminClient } = await import("../lib/supabase");
  // The generated Database type doesn't know these tables yet; the loader is
  // schema-driven, so it works against the untyped client.
  return createAdminClient() as unknown as ReturnType<
    typeof createAdminClient
  > & {
    from: (table: string) => any;
  };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--sql")) {
    console.log(buildMigrationSql());
    return;
  }

  const force = args.includes("--force");
  const onlyArg = args.find((a) => a.startsWith("--only="));
  const only = onlyArg ? onlyArg.slice("--only=".length).split(",") : null;

  const specs = only
    ? WORKBOOKS.filter((s) => only.includes(s.table))
    : WORKBOOKS;

  if (!specs.length) throw new Error(`No tables matched --only=${only?.join(",")}`);

  const admin = await getAdmin();
  console.log(`Loading ${specs.length} workbook table(s)${force ? " (--force)" : ""}…\n`);

  const results = [];
  for (const spec of specs) {
    results.push(await loadOne(admin, spec, force));
  }

  console.log("\n--- summary ---");
  const total = results.reduce((sum, r) => sum + r.loaded, 0);
  const bad = results.filter((r) => r.loaded !== r.expected);
  for (const r of results) {
    console.log(
      `  ${r.table.padEnd(20)} ${String(r.loaded).padStart(6)} / ${String(r.expected).padEnd(6)}` +
        `${r.loaded === r.expected ? "" : "  <-- MISMATCH"}${r.skipped ? "  (skipped)" : ""}`
    );
  }
  console.log(`  ${"TOTAL".padEnd(20)} ${String(total).padStart(6)} rows`);

  if (bad.length) {
    throw new Error(`${bad.length} table(s) did not match the expected row count.`);
  }
  console.log("\nAll tables match their expected row counts.");
}

main().catch((error: unknown) => {
  console.error(`\nLoad failed: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
