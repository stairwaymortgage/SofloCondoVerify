import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { isIntent } from "@/lib/intents";
import { routeLead } from "@/lib/routing";
import { pushLeadToGhl } from "@/lib/ghl";

export const dynamic = "force-dynamic";

const MAX = { name: 120, email: 200, phone: 40, message: 2000, building: 200 };

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
  /** Honeypot — real users never see this field, so a value means a bot. */
  company?: unknown;
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

  let admin;
  let leadId: number;

  // Step 1 — Supabase. This is the one that is allowed to fail the request:
  // it is the record of the lead, and if it didn't land, nothing did.
  try {
    admin = createAdminClient();
    const { data, error } = await admin
      .from("leads")
      .insert({
        intent,
        building_id: buildingId,
        name,
        email: email || null,
        phone: phone || null,
        message: message || null,
        // Stamped server-side: the client never chooses its own tier.
        ...routeLead(intent),
      })
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
    }
  } else if (ghl.status === "skipped") {
    console.info(`[api/leads] lead ${leadId}: ${ghl.reason}`);
  } else {
    // Left with ghl_synced = false on purpose — this is the retry queue.
    console.error(`[api/leads] lead ${leadId} GHL push failed: ${ghl.reason}`);
  }

  return NextResponse.json({ ok: true });
}
