import type { IntentValue } from "./intents";

/**
 * GoHighLevel delivery.
 *
 * Supabase is the source of truth for a lead. This module is the delivery to
 * the CRM, and it is written so that nothing in it can cost us a lead:
 * every function returns a result object instead of throwing, the caller
 * treats failure as a logged non-event, and the token lives server-side only.
 *
 * Configuration is GHL_PRIVATE_TOKEN (a Private Integration Token) and
 * GHL_LOCATION_ID. With either missing the whole module no-ops and says so.
 */

const API = "https://services.leadconnectorhq.com";
const API_VERSION = "2021-07-28";
const SOURCE = "SoFloCondoVerify";

/**
 * The one and only tag. Every contact this site produces carries it and
 * nothing else, so the cohort is a single clean filter in GHL.
 */
const SITE_TAG = "site-sfcv";

/** Nothing should hang a lead submission — GHL gets a short leash. */
const TIMEOUT_MS = 8000;

export interface GhlLead {
  intent: IntentValue;
  name: string;
  email: string | null;
  phone: string | null;
  /** Building name as typed on the form, if any. */
  building: string | null;
  /** buildings.id when the form was opened from a building record. */
  buildingId: number | null;
  /** Free-text "anything else" from the form. */
  message: string | null;
  /** Path the request was started from, e.g. /building/1443. */
  sourcePage: string | null;
  /** Raw ?record= token — a buildings id, or a precon slug. */
  recordId: string | null;
  /** Qualifier answers from the multi-step modal, if any. */
  answers: Record<string, unknown> | null;
}

export type GhlResult =
  | { status: "synced"; contactId: string; noteAdded: boolean; fieldMode: FieldMode }
  | { status: "skipped"; reason: string }
  | { status: "failed"; reason: string };

/** How the customFields array was addressed on the attempt that succeeded. */
export type FieldMode = "id" | "key" | "none";

/**
 * The Intent dropdown in GHL. Its options are configured over there, and a
 * value that isn't an exact match silently fails to select — so this map is
 * a contract with the CRM, not display copy.
 *
 * Deliberately NOT intentLabel(): that is the wording shown to visitors on
 * the site and someone will reasonably reword it one day. "I'm on a condo
 * board" reads well in a form; the GHL option is "HOA board help". Tying the
 * two together would mean a copy edit quietly breaking the dropdown.
 */
const INTENT_OPTION: Record<IntentValue, string> = {
  finance: "Finance a purchase",
  "foreign-national": "Foreign-national loan",
  sell: "Sell my unit",
  board: "HOA board help",
  "check-building": "Check a building",
  preconstruction: "Preconstruction top 10",
};

/**
 * Our logical field name -> the fieldKey GHL reports for it. GHL prefixes
 * contact-level custom fields with "contact."; the short name is what the
 * write API accepts in `key` form.
 */
const FIELD_KEYS = {
  intent: "contact.intent",
  building_name: "contact.building_name",
  building_id: "contact.building_id",
  message: "contact.message",
  source_page: "contact.source_page",
  record_id: "contact.record_id",
} as const;

type FieldName = keyof typeof FIELD_KEYS;

/** Both halves of the config, or null when the integration is switched off. */
function config(): { token: string; locationId: string } | null {
  const token = process.env.GHL_PRIVATE_TOKEN?.trim();
  const locationId = process.env.GHL_LOCATION_ID?.trim();
  if (!token || !locationId) return null;
  return { token, locationId };
}

/** Whether a GHL push will be attempted at all. */
export function ghlConfigured(): boolean {
  return config() !== null;
}

/**
 * GHL wants firstName / lastName. People type one word, three words, or a
 * name with a suffix; everything after the first token becomes the surname,
 * and a single token leaves lastName empty rather than inventing one.
 */
export function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

/**
 * Exactly one tag, always. The intent used to ride along here as a second
 * tag; it now lives only in the `intent` custom field and in the note, which
 * is worth knowing about — if the custom-field write ever degrades to the
 * `none` mode below, the note becomes the sole record of the intent.
 *
 * `lead` is unused and stays in the signature so the tag set can depend on
 * the lead again without touching every call site.
 */
export function leadTags(_lead: GhlLead): string[] {
  return [SITE_TAG];
}

/**
 * The note is now a readable summary rather than the only copy of the data —
 * every value below also lands in its own custom field. It stays because a
 * note is what a human sees first when they open the contact.
 */
export function leadNote(lead: GhlLead): string {
  return [
    `Source: ${SOURCE}`,
    `Intent: ${INTENT_OPTION[lead.intent]} (${lead.intent})`,
    lead.building ? `Building: ${lead.building}` : null,
    lead.buildingId
      ? `Record: https://soflocondoverify.com/building/${lead.buildingId}`
      : null,
    lead.sourcePage ? `From: ${lead.sourcePage}` : null,
    lead.answers ? `\nQualifier: ${answersSummary(lead.answers)}` : null,
    lead.message ? `\nMessage:\n${lead.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * One-line readable summary of the qualifier answers for the GHL note.
 * e.g. "Found a unit · Investment / rental · $1.2M · 20–25% down · Not yet
 * pre-approved · 1–3 months · concerns: Reserves / budget, Insurance"
 */
function answersSummary(answers: Record<string, unknown>): string {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(answers)) {
    if (key === "building") continue; // already in the Building: line
    if (value == null) continue;

    if (typeof value === "string") {
      parts.push(value);
    } else if (typeof value === "number") {
      // Price slider
      parts.push(fmtPrice(value));
    } else if (Array.isArray(value) && value.length > 0) {
      parts.push(value.join(", "));
    } else if (typeof value === "object" && "q" in (value as Record<string, unknown>)) {
      // building-type object, skip (handled above)
    }
  }

  return parts.join(" · ") || "(none)";
}

function fmtPrice(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return "$" + (m % 1 === 0 ? m : m.toFixed(1)) + "M";
  }
  return "$" + Math.round(n / 1_000) + "K";
}

/** The values to write, keyed by logical field name. Empties are dropped. */
function fieldValues(lead: GhlLead): Partial<Record<FieldName, string>> {
  const values: Partial<Record<FieldName, string>> = {
    intent: INTENT_OPTION[lead.intent],
  };
  if (lead.building) values.building_name = lead.building;
  if (lead.buildingId) values.building_id = String(lead.buildingId);
  if (lead.message) values.message = lead.message;
  if (lead.sourcePage) values.source_page = lead.sourcePage;
  if (lead.recordId) values.record_id = lead.recordId;
  return values;
}

/* ------------------------------------------------------------------ HTTP */

interface GhlResponse {
  ok: boolean;
  status: number;
  json: Record<string, unknown>;
}

async function ghlFetch(
  path: string,
  token: string,
  init: { method: "GET" | "POST"; body?: unknown }
): Promise<GhlResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API}${path}`, {
      method: init.method,
      headers: {
        Authorization: `Bearer ${token}`,
        Version: API_VERSION,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: controller.signal,
      cache: "no-store",
    });

    let json: Record<string, unknown> = {};
    try {
      json = (await response.json()) as Record<string, unknown>;
    } catch {
      // A body we can't parse is not itself an error — status decides.
    }

    return { ok: response.ok, status: response.status, json };
  } finally {
    clearTimeout(timer);
  }
}

/* -------------------------------------------------- custom field lookup */

interface FieldCache {
  /** logical name -> GHL custom field id */
  ids: Partial<Record<FieldName, string>>;
  at: number;
}

let cache: FieldCache | null = null;

/** Long enough that a burst of leads costs one lookup; short enough that
 *  creating a missing field in GHL takes effect the same day. */
const CACHE_MS = 10 * 60 * 1000;

/**
 * Resolve the location's custom fields to ids.
 *
 * Ids are unambiguous where `key` is not: the write API's key form has
 * shifted between GHL versions, and a key it doesn't recognise is rejected
 * or silently dropped. Looking the ids up once and caching them buys the
 * accurate path for one extra request per ten minutes.
 *
 * Returns an empty map on any failure — a Private Integration Token without
 * the locations scope will 401 here, and that must degrade to the key form
 * rather than stop the lead.
 */
async function resolveFieldIds(
  token: string,
  locationId: string
): Promise<Partial<Record<FieldName, string>>> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.ids;

  const ids: Partial<Record<FieldName, string>> = {};
  try {
    const response = await ghlFetch(
      `/locations/${locationId}/customFields`,
      token,
      { method: "GET" }
    );

    if (!response.ok) {
      console.warn(
        `[ghl] custom field lookup failed (${errorText(response.json, response.status)}); using key form`
      );
      // Cache the failure too, so every lead doesn't re-pay the round trip.
      cache = { ids, at: Date.now() };
      return ids;
    }

    const list = (response.json.customFields ??
      response.json.customField ??
      []) as { id?: unknown; fieldKey?: unknown }[];

    const byKey = new Map<string, string>();
    for (const field of Array.isArray(list) ? list : []) {
      if (typeof field.id === "string" && typeof field.fieldKey === "string") {
        byKey.set(field.fieldKey.trim().toLowerCase(), field.id);
      }
    }

    for (const [name, key] of Object.entries(FIELD_KEYS) as [FieldName, string][]) {
      const id = byKey.get(key);
      if (id) ids[name] = id;
      else console.warn(`[ghl] no custom field in GHL for "${key}"`);
    }
  } catch (error) {
    console.warn("[ghl] custom field lookup threw; using key form:", error);
  }

  cache = { ids, at: Date.now() };
  return ids;
}

/** Test seam: drop the memoised field ids. */
export function resetFieldCache(): void {
  cache = null;
}

/* ---------------------------------------------------------------- shapes */

function customFieldsById(
  lead: GhlLead,
  ids: Partial<Record<FieldName, string>>
): { id: string; field_value: string }[] {
  return Object.entries(fieldValues(lead))
    .filter(([name]) => ids[name as FieldName])
    .map(([name, value]) => ({ id: ids[name as FieldName]!, field_value: value }));
}

/**
 * Key form. Both `field_value` and `value` are sent: the two spellings appear
 * across GHL's own versions of this endpoint, and an unrecognised extra
 * property is ignored where a missing expected one is not.
 */
function customFieldsByKey(lead: GhlLead) {
  return Object.entries(fieldValues(lead)).map(([key, value]) => ({
    key,
    field_value: value,
    value,
  }));
}

/** Pull the contact id out of a create response or a duplicate-contact error. */
function contactIdFrom(json: Record<string, unknown>): string | null {
  const contact = json.contact as { id?: unknown } | undefined;
  if (contact && typeof contact.id === "string") return contact.id;

  // A location that disallows duplicates rejects the create with 400 and
  // hands back the id of the contact that already exists. That is a
  // successful delivery — the person is in the CRM — so we take the id.
  const meta = json.meta as { contactId?: unknown } | undefined;
  if (meta && typeof meta.contactId === "string") return meta.contactId;

  if (typeof json.id === "string") return json.id;
  return null;
}

function errorText(json: Record<string, unknown>, status: number): string {
  const message = json.message;
  if (typeof message === "string") return `${status}: ${message}`;
  if (Array.isArray(message)) return `${status}: ${message.join("; ")}`;
  return `${status}`;
}

/* ----------------------------------------------------------------- push */

/**
 * Create (or match) the contact, then attach the note.
 *
 * The custom fields are attempted by id, then by key, then abandoned. Each
 * step down only happens on a request-shaped rejection (400/422) — an auth
 * or rate-limit failure will fail identically however the fields are
 * addressed, so retrying it just burns the timeout budget.
 *
 * Dropping to no custom fields at all is the last resort and still a
 * success: SITE_TAG and the note carry the lead, and a contact in the CRM
 * missing its field values beats no contact at all.
 */
export async function pushLeadToGhl(lead: GhlLead): Promise<GhlResult> {
  const cfg = config();
  if (!cfg) return { status: "skipped", reason: "GHL not configured" };

  const { firstName, lastName } = splitName(lead.name);
  const base = {
    locationId: cfg.locationId,
    firstName,
    lastName,
    name: lead.name,
    email: lead.email ?? undefined,
    phone: lead.phone ?? undefined,
    source: SOURCE,
    tags: leadTags(lead),
  };

  let contactId: string | null = null;
  let fieldMode: FieldMode = "none";
  let lastError = "";

  try {
    const ids = await resolveFieldIds(cfg.token, cfg.locationId);
    const byId = customFieldsById(lead, ids);

    // Attempts in descending fidelity. Each is only reached if the previous
    // one was rejected for the shape of the request.
    const attempts: { mode: FieldMode; customFields?: unknown[] }[] = [];
    if (byId.length > 0) attempts.push({ mode: "id", customFields: byId });
    attempts.push({ mode: "key", customFields: customFieldsByKey(lead) });
    attempts.push({ mode: "none" });

    for (const attempt of attempts) {
      const body =
        attempt.customFields === undefined
          ? base
          : { ...base, customFields: attempt.customFields };

      const response = await ghlFetch("/contacts/", cfg.token, {
        method: "POST",
        body,
      });

      contactId = contactIdFrom(response.json);
      if (contactId) {
        fieldMode = attempt.mode;
        break;
      }

      lastError = errorText(response.json, response.status);
      if (response.status !== 400 && response.status !== 422) break;

      const next = attempts[attempts.indexOf(attempt) + 1];
      if (next) {
        console.warn(
          `[ghl] create rejected with customFields by ${attempt.mode} (${lastError}); retrying by ${next.mode}`
        );
      }
    }
  } catch (error) {
    lastError = error instanceof Error ? error.message : String(error);
  }

  if (!contactId) {
    return { status: "failed", reason: lastError || "no contact id returned" };
  }

  if (fieldMode === "none") {
    console.warn(
      `[ghl] contact ${contactId} created without custom fields — check the ` +
        `SoFloCondoVerify field keys in GHL. Tags and note still carry the lead.`
    );
  }

  let noteAdded = false;
  try {
    const note = await ghlFetch(`/contacts/${contactId}/notes`, cfg.token, {
      method: "POST",
      body: { body: leadNote(lead) },
    });
    noteAdded = note.ok;
    if (!note.ok) {
      console.warn(
        `[ghl] note failed for ${contactId}: ${errorText(note.json, note.status)}`
      );
    }
  } catch (error) {
    console.warn(`[ghl] note threw for ${contactId}:`, error);
  }

  return { status: "synced", contactId, noteAdded, fieldMode };
}
