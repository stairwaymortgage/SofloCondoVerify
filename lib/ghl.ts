import { intentLabel, type IntentValue } from "./intents";

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

/** Nothing should hang a lead submission — GHL gets a short leash. */
const TIMEOUT_MS = 8000;

export interface GhlLead {
  intent: IntentValue;
  name: string;
  email: string | null;
  phone: string | null;
  /** Building name as typed on the form, if any. */
  building: string | null;
  /** buildings.id when the form was opened from a record page. */
  buildingId: number | null;
  /** Free-text "anything else" from the form. */
  message: string | null;
}

export type GhlResult =
  | { status: "synced"; contactId: string; noteAdded: boolean }
  | { status: "skipped"; reason: string }
  | { status: "failed"; reason: string };

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
 * Tags carry the intent even when no custom field exists to hold it. They are
 * the durable copy: tags cannot be rejected for referencing an unconfigured
 * field, so this is what survives a fresh GHL location.
 */
export function leadTags(lead: GhlLead): string[] {
  const tags = ["soflocondoverify", `intent: ${lead.intent}`];
  if (lead.building || lead.buildingId) tags.push("has-building");
  return tags;
}

/** The note body — building and message, which no tag could hold. */
export function leadNote(lead: GhlLead): string {
  return [
    `Source: ${SOURCE}`,
    `Intent: ${intentLabel(lead.intent)} (${lead.intent})`,
    lead.building ? `Building: ${lead.building}` : null,
    lead.buildingId
      ? `Record: https://soflocondoverify.com/building/${lead.buildingId}`
      : null,
    lead.message ? `\nMessage:\n${lead.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function customFields(lead: GhlLead) {
  const fields: { key: string; field_value: string }[] = [
    { key: "intent", field_value: lead.intent },
  ];
  if (lead.building) fields.push({ key: "building", field_value: lead.building });
  if (lead.buildingId) {
    fields.push({ key: "building_id", field_value: String(lead.buildingId) });
  }
  return fields;
}

async function ghlFetch(
  path: string,
  token: string,
  body: unknown
): Promise<{ ok: boolean; status: number; json: Record<string, unknown> }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Version: API_VERSION,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
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

/**
 * Create (or match) the contact and attach the note.
 *
 * Two deliberate pieces of defensiveness:
 *
 *  1. If the request carrying customFields is rejected, it is retried without
 *     them. `customFields` keyed by name fails when the field has not been
 *     created in the GHL location yet, and losing the whole contact over an
 *     unconfigured field would be the wrong trade — the intent is already in
 *     the tags and the note either way.
 *
 *  2. The note is best-effort and reported separately. A contact that landed
 *     without its note is still a synced lead; failing it would strand a
 *     person who is sitting in the CRM.
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
  let lastError = "";

  try {
    const withFields = await ghlFetch("/contacts/", cfg.token, {
      ...base,
      customFields: customFields(lead),
    });
    contactId = contactIdFrom(withFields.json);

    if (!contactId && !withFields.ok) {
      lastError = errorText(withFields.json, withFields.status);

      // Retry bare. Auth and rate-limit failures will fail again the same
      // way, so only a request-shaped rejection is worth a second attempt.
      if (withFields.status === 400 || withFields.status === 422) {
        console.warn(
          `[ghl] create with customFields rejected (${lastError}); retrying without them`
        );
        const bare = await ghlFetch("/contacts/", cfg.token, base);
        contactId = contactIdFrom(bare.json);
        if (!contactId && !bare.ok) {
          lastError = errorText(bare.json, bare.status);
        }
      }
    }
  } catch (error) {
    lastError = error instanceof Error ? error.message : String(error);
  }

  if (!contactId) {
    return { status: "failed", reason: lastError || "no contact id returned" };
  }

  let noteAdded = false;
  try {
    const note = await ghlFetch(`/contacts/${contactId}/notes`, cfg.token, {
      body: leadNote(lead),
    });
    noteAdded = note.ok;
    if (!note.ok) {
      console.warn(`[ghl] note failed for ${contactId}: ${errorText(note.json, note.status)}`);
    }
  } catch (error) {
    console.warn(`[ghl] note threw for ${contactId}:`, error);
  }

  return { status: "synced", contactId, noteAdded };
}
