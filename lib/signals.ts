import type { Building } from "./database.types";
import { num } from "./format";

/**
 * Status tones. The rule, applied everywhere:
 *   go      (green) — approved / cleared. NOTHING ELSE may be green.
 *   flag    (red)   — rejected / revoked.
 *   caution (amber) — unconfirmed, expired, pending, needs checking.
 *   none    (grey)  — not reviewed, nothing on file, or informational only.
 *
 * Framing follows public-record limits: we never say "non-compliant", only
 * "unconfirmed" — absence of a filing is not evidence of a violation.
 */
export type Tone = "go" | "flag" | "caution" | "none";

export interface Signal {
  /** Signal name, e.g. "FHA approval". */
  name: string;
  /** Where the underlying record comes from. */
  source: string;
  tone: Tone;
  /** Human-readable status. */
  value: string;
  /** As-of / expiry detail, or "—". */
  asOf: string;
}

const dash = "—";

function text(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** "12/01/2020" and "2026-03-26" both appear in the source data. */
function asOfDate(value: string | null | undefined, prefix = ""): string {
  const raw = text(value);
  if (!raw) return dash;
  return prefix ? `${prefix} ${raw}` : raw;
}

function fhaSignal(b: Building): Signal {
  const status = text(b.fha_status);
  const method = text(b.fha_method);
  const suffix = method ? ` (${method})` : "";

  let tone: Tone = "none";
  let value = "No approval on file";

  if (status === "Approved") {
    tone = "go";
    value = `Approved${suffix}`;
  } else if (status?.startsWith("Rejected")) {
    tone = "flag";
    value = status === "Rejected" ? "Rejected" : "Single-unit approval rejected";
  } else if (status === "Expired") {
    tone = "caution";
    value = `Approval expired${suffix}`;
  } else if (status === "Withdrawn") {
    tone = "caution";
    value = "Approval withdrawn";
  } else if (status) {
    tone = "caution";
    value = status;
  }

  return {
    name: "FHA approval",
    source: "HUD Condominiums search",
    tone,
    value,
    asOf: asOfDate(b.fha_exp, "expires"),
  };
}

function vaSignal(b: Building): Signal {
  const status = text(b.va_status);

  let tone: Tone = "none";
  let value = "Not on the VA list";

  if (status?.startsWith("Accepted") || status === "HUD Accepted") {
    tone = "go";
    value = status;
  } else if (status === "Rejected") {
    tone = "flag";
    value = "Rejected";
  } else if (status === "Deleted") {
    tone = "caution";
    value = "Removed from list — unconfirmed";
  } else if (status === "Unknown") {
    tone = "caution";
    value = "Unconfirmed";
  } else if (status) {
    tone = "caution";
    value = status;
  }

  return {
    name: "VA approval",
    source: "VA condominium report",
    tone,
    value,
    asOf: asOfDate(b.va_date),
  };
}

/**
 * Conventional (Fannie/Freddie) standing is not publishable — the underlying
 * lists are not public record. It is always amber, never a verdict.
 */
function conventionalSignal(b: Building): Signal {
  return {
    name: "Conventional (Fannie/Freddie)",
    source: "not publishable — reviewed privately",
    tone: "caution",
    value: "Not publishable — check with a licensed pro",
    asOf: asOfDate(b.conv_date),
  };
}

/**
 * Milestone/SB4D enrolment is a fact about the building (3+ stories), not an
 * approval and not a failure — so it stays informational rather than green.
 */
function sb4dSignal(b: Building): Signal {
  const inProgram = text(b.sb4d) === "Yes";
  const buildings = b.sb4d_bldgs_3plus;
  const units = b.sb4d_units;

  const detail = [
    buildings ? `${buildings} bldg${buildings === 1 ? "" : "s"} 3+ stories` : null,
    units ? `${num(units)} units` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    name: "Milestone inspection (SB4D)",
    source: "FL DBPR milestone program",
    tone: "none",
    value: inProgram ? "In milestone program" : "Not in program on file",
    asOf: detail || dash,
  };
}

function sirsSignal(b: Building): Signal {
  const filed = text(b.sirs_filed);

  let tone: Tone = "none";
  let value = "Nothing on file";

  if (filed === "Yes") {
    tone = "go";
    value = "Reserve study on file";
  } else if (filed === "No match") {
    tone = "caution";
    value = "Unconfirmed — no filing found";
  } else if (filed) {
    tone = "caution";
    value = filed;
  }

  return {
    name: "Reserve study (SIRS)",
    source: "FL DBPR filing",
    tone,
    value,
    asOf: dash,
  };
}

function registrySignal(b: Building): Signal {
  const status = text(b.registry_status);
  const enforcement = text(b.registry_enf) === "Yes";

  let tone: Tone = "none";
  let value = "No registry record on file";

  if (status === "Issued") {
    tone = "go";
    value = "In good standing";
  } else if (status === "Rejected" || status === "Revoked") {
    tone = "flag";
    value = status;
  } else if (status === "Expired") {
    tone = "caution";
    value = "Registration expired";
  } else if (status) {
    tone = "caution";
    value = status;
  }

  // An open enforcement action is never a clearance, whatever the status says.
  if (enforcement) {
    tone = tone === "flag" ? "flag" : "caution";
    value = `${value} · open enforcement`;
  }

  return {
    name: "Association registry",
    source: "county / state — ordinance only",
    tone,
    value,
    asOf: dash,
  };
}

function recertSignal(b: Building): Signal {
  const status = text(b.recert_status);
  const year = b.recert_year;

  let tone: Tone = "none";
  let value = "Nothing on file";

  if (status === "Issued" || status === "Closed") {
    tone = "go";
    value = status === "Issued" ? "Certificate issued" : "Case closed";
  } else if (status === "Exempt") {
    tone = "go";
    value = "Exempt — not required";
  } else if (status === "Revoked") {
    tone = "flag";
    value = "Revoked";
  } else if (status === "In Progress") {
    tone = "caution";
    value = "In progress — unconfirmed";
  } else if (status) {
    tone = "caution";
    value = status;
  }

  return {
    name: "Recertification (40-year)",
    source: "county building department",
    tone,
    value,
    asOf: year ? `due ${year}` : dash,
  };
}

/** The seven signals, in the order they appear on the record. */
export function buildSignals(building: Building): Signal[] {
  return [
    fhaSignal(building),
    vaSignal(building),
    conventionalSignal(building),
    sb4dSignal(building),
    sirsSignal(building),
    registrySignal(building),
    recertSignal(building),
  ];
}

/** Attention order for the due-diligence read: what to look into first. */
const TONE_ORDER: Record<Tone, number> = { flag: 0, caution: 1, none: 2, go: 3 };

/**
 * The same seven signals, reordered so anything rejected or unconfirmed leads.
 * Stable within a tone, so the record order is preserved inside each group.
 */
export function flaggedFirst(signals: Signal[]): Signal[] {
  return [...signals].sort((a, b) => TONE_ORDER[a.tone] - TONE_ORDER[b.tone]);
}

/**
 * The priority set: tri-county buildings carrying two or more flagged signals
 * in the source data. Stacked flags are what makes a due-diligence read worth
 * publishing — one unconfirmed filing on its own rarely is.
 */
export function hasStackedFlags(
  building: Pick<Building, "tri_county" | "signal_count">
): boolean {
  return building.tri_county === "Yes" && (building.signal_count ?? 0) >= 2;
}

/**
 * Compact tones for the FHA/VA chips on a search-result card. These take the
 * narrow projection the search API returns, so `fha_method` may be absent.
 */
export function fhaTone(
  building: Pick<Building, "fha_status"> & Partial<Pick<Building, "fha_method">>
): Tone {
  return fhaSignal(building as Building).tone;
}

export function vaTone(building: Pick<Building, "va_status">): Tone {
  return vaSignal(building as Building).tone;
}

/** Short chip labels — kept terse so cards stay scannable. */
export function chipLabel(status: string | null | undefined, fallback: string): string {
  const value = text(status);
  if (!value) return fallback;
  if (value.startsWith("Rejected")) return "Rejected";
  if (value.startsWith("Accepted")) return "Accepted";
  return value;
}

/** Human record number, e.g. SCV-33141-00042. */
export function recordId(building: Pick<Building, "id" | "zip">): string {
  const zip = text(building.zip) ?? "00000";
  return `SCV-${zip}-${String(building.id).padStart(5, "0")}`;
}
