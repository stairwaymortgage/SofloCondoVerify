import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { isIntent } from "@/lib/intents";
import { routeLead } from "@/lib/routing";
import { pushLeadToGhl } from "@/lib/ghl";
import type { LeadInsert } from "@/lib/database.types";

export const dynamic = "force-dynamic";

const MAX = {
  name: 120,
  email: 200,
  phone: 40,
  message: 2000,
  building: 200,
  record: 200,
  sourcePage: 300,
  consentText: 1000,
};

/** Deliberately loose — just enough to reject obvious typos. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface LeadBody {
  intent?: unknown;
  building_id?: unknown;
  building?: unknown;
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
  record_id?: unknown;
  source_page?: unknown;
  /**
   * TCPA consent tick from InquiryForm. Tri-state on purpose:
   *   true      — consent given, the only value that may be submitted
   *   false     — a form that shows the box and had it unticked: rejected
   *   undefined — a form that predates the box (ConnectForm on /connect),
   *               which is allowed through rather than silently losing leads
   */
  consent_given?: unknown;
  /** The consent wording as shown, stored with the tick. */
  consent_text?: unknown;
  /** Honeypot — real users never see this field, so a value means a bot. */
  company?: unknown;
  /** Qualifier answers from the multi-step modal. Stored as JSONB. */
  answers?: unknown;
}

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  let body: LeadBody;
  try {
    body = (await request.json()) as LeadBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Silently accept-and-drop honeypot hits so bots don't learn the rule.
  if (str(body.company, 100)) {
    return NextResponse.json({ ok: true });
  }

  const intent = body.intent;
  if (!isIntent(intent)) {
    return NextResponse.json(
      { error: "Choose what you’d like help with." },
      { status: 400 }
    );
  }

  // Consent is checked before anything else about the person is read: if the
  // box was shown and left unticked there is nothing here we are permitted to
  // act on, so there is no reason to go further. Absent means a caller that
  // has no consent box at all — see the LeadBody note.
  if (body.consent_given !== undefined && body.consent_given !== true) {
    return NextResponse.json(
      { error: "Please tick the consent box so we can contact you." },
      { status: 400 }
    );
  }

  const name = str(body.name, MAX.name);
  if (name.length < 2) {
    return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  }

  const email = str(body.email, MAX.email);
  const phone = str(body.phone, MAX.phone);
  if (!email && !phone) {
    return NextResponse.json(
      { error: "Enter an email address or a phone number so someone can reach you." },
      { status: 400 }
    );
  }
  if (email && !EMAIL.test(email)) {
    return NextResponse.json(
      { error: "That email address doesn’t look right." },
      { status: 400 }
    );
  }

  // The typed building name rides along in the message; building_id is the link.
  const buildingName = str(body.building, MAX.building);
  const note = str(body.message, MAX.message);
  const message = [buildingName ? `Building: ${buildingName}` : null, note]
    .filter(Boolean)
    .join("\n\n");

  const buildingIdRaw = Number(body.building_id);
  const buildingId =
    Number.isInteger(buildingIdRaw) && buildingIdRaw > 0 ? buildingIdRaw : null;

  // Context for the CRM, supplied by the client and therefore not trusted.
  // record_id is a slug or a number; source_page must look like one of our
  // own paths, so a crafted value can't put an arbitrary URL in front of
  // whoever works the lead.
  const recordRaw = str(body.record_id, MAX.record);
  const recordId = /^[A-Za-z0-9\-_]+$/.test(recordRaw) ? recordRaw : null;

  const pageRaw = str(body.source_page, MAX.sourcePage);
  const sourcePage = /^\/[A-Za-z0-9\-_/?=&.%]*$/.test(pageRaw) ? pageRaw : null;

  // Null rather than false for a caller that has no consent box: "not asked"
  // and "asked and refused" are different facts, and defaulting to false would
  // record the second when the first is true. See the 20260819 migration.
  const consentGiven = body.consent_given === true ? true : null;
  const consentText = consentGiven
    ? str(body.consent_text, MAX.consentText) || null
    : null;

  // Qualifier answers from the multi-step modal. Plain object or null.
  const answers =
    body.answers != null &&
    typeof body.answers === "object" &&
    !Array.isArray(body.answers)
      ? (body.answers as Record<string, unknown>)
      : null;

  let admin;
  let leadId: number;

  const row: LeadInsert = {
    intent,
    building_id: buildingId,
    name,
    email: email || null,
    phone: phone || null,
    message: message || null,
    // Which page produced the lead. Validated above, so this is one of our
    // own paths or null — never an arbitrary string the client chose.
    source_page: sourcePage,
    // The TCPA record: the tick and the wording it attested to. created_at
    // supplies the when.
    consent_given: consentGiven,
    consent_text: consentText,
    // Stamped server-side: the client never chooses its own tier.
    ...routeLead(intent),
  };

  // Step 1 — Supabase. This is the one that is allowed to fail the request:
  // it is the record of the lead, and if it didn't land, nothing did.
  try {
    admin = createAdminClient();
    // The `answers` JSONB column exists in the database; the generated types
    // have not been regenerated to include it yet.
    const fullRow = answers ? { ...row, answers } : row;
    const { data, error } = await admin
      .from("leads")
      .insert(fullRow as LeadInsert)
      .select("id")
      .single();

    if (error || !data) {
      console.error("[api/leads]", error?.message ?? "insert returned no row");
      return NextResponse.json(
        { error: "We couldn’t save your request. Please try again." },
        { status: 500 }
      );
    }
    leadId = data.id;
  } catch (error) {
    console.error("[api/leads]", error);
    return NextResponse.json(
      { error: "We couldn’t save your request. Please try again." },
      { status: 500 }
    );
  }

  // Step 2 — GoHighLevel. Delivery, not capture. The lead is already safe, so
  // every outcome here ends in the same 200: a CRM that is down, throttled,
  // misconfigured or simply switched off must not read to the person on the
  // form as "your request failed, try again" — that produces duplicates of a
  // lead we already hold.
  const ghl = await pushLeadToGhl({
    intent,
    name,
    email: email || null,
    phone: phone || null,
    building: buildingName || null,
    buildingId,
    message: note || null,
    sourcePage,
    recordId,
    answers,
  });

  if (ghl.status === "synced") {
    const { error } = await admin
      .from("leads")
      .update({ ghl_synced: true, ghl_contact_id: ghl.contactId })
      .eq("id", leadId);

    // The contact exists in GHL either way; only our bookkeeping is off, and
    // the row shows as unsynced, which is the safe direction to be wrong in.
    if (error) {
      console.error(
        `[api/leads] lead ${leadId} synced to GHL ${ghl.contactId} but the flag did not save:`,
        error.message
      );
    } else {
      console.info(
        `[api/leads] lead ${leadId} -> GHL ${ghl.contactId} ` +
          `(customFields by ${ghl.fieldMode}, note ${ghl.noteAdded ? "added" : "failed"})`
      );
    }
  } else if (ghl.status === "skipped") {
    console.info(`[api/leads] lead ${leadId}: ${ghl.reason}`);
  } else {
    // Left with ghl_synced = false on purpose — this is the retry queue.
    console.error(`[api/leads] lead ${leadId} GHL push failed: ${ghl.reason}`);
  }

  return NextResponse.json({ ok: true });
}
