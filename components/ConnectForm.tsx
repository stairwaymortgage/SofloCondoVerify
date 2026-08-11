"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./ConnectForm.module.css";
import { track } from "@/lib/analytics";
import { INTENTS, type IntentValue } from "@/lib/intents";

interface Props {
  defaultIntent: IntentValue;
  buildingId: number | null;
  buildingLabel: string;
}

export default function ConnectForm({
  defaultIntent,
  buildingId,
  buildingLabel,
}: Props) {
  const [intent, setIntent] = useState<IntentValue>(defaultIntent);
  const [building, setBuilding] = useState(buildingLabel);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent,
          building_id: buildingId,
          building,
          name,
          email,
          phone,
          message,
          company,
        }),
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSent(true);

      // Accepted leads only — a validation rejection returns above. No
      // name, email, phone or message is sent to GA: the intent and whether
      // a record was attached is the whole of what analytics needs, and the
      // rest is exactly the data the privacy notice promises we route to the
      // network rather than broadcast.
      track("connect_submitted", {
        intent,
        has_building: buildingId !== null || building.trim() !== "",
        building_id: buildingId ?? undefined,
      });
    } catch {
      setError("We couldn’t reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className={styles.done}>
        <div className={`${styles.doneKicker} mono`}>Request received</div>
        <h2>Thanks — that’s all we need.</h2>
        <p>
          Your request has been passed to our network. Someone licensed to handle it
          will reach out directly. There’s nothing else for you to do, and no
          obligation to proceed with anyone who contacts you.
        </p>
        <Link href="/" className={styles.doneBtn}>
          Back to the lookup
        </Link>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <fieldset className={styles.fs}>
        <legend className={styles.legend}>What would you like help with?</legend>
        <div className={styles.intents}>
          {INTENTS.map((option) => (
            <label
              key={option.value}
              className={`${styles.intent} ${
                intent === option.value ? styles.intentOn : ""
              }`}
            >
              <input
                type="radio"
                name="intent"
                value={option.value}
                checked={intent === option.value}
                onChange={() => setIntent(option.value)}
              />
              <span className={styles.intentBody}>
                <span className={styles.intentLabel}>{option.label}</span>
                <span className={styles.intentHint}>{option.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.field}>
        <label htmlFor="building">Building</label>
        <input
          id="building"
          type="text"
          value={building}
          onChange={(e) => setBuilding(e.target.value)}
          placeholder="Building name or address (optional)"
          autoComplete="off"
        />
        {buildingId !== null && (
          <span className={styles.hint}>
            Prefilled from record #{buildingId}. Edit it if that’s not the building
            you mean.
          </span>
        )}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="name">
            Your name <span className={styles.req}>required</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            inputMode="tel"
          />
        </div>
        <div className={styles.fieldNote}>
          Give us an email or a phone number — whichever you’d rather be reached on.
          One is enough.
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="message">Anything else we should pass along?</label>
        <textarea
          id="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Timeline, budget, unit number, what you're trying to find out…"
        />
      </div>

      {/* Honeypot: hidden from people, catnip for bots. */}
      <div className={styles.hp} aria-hidden>
        <label htmlFor="company">Company</label>
        <input
          id="company"
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className={styles.disclosure}>
        <div className={styles.disclosureHead}>Before you send this</div>
        <ul>
          <li>
            Your request — including your contact details — <b>may be shared with one
            or more licensed professionals</b> in our network so they can respond to
            you.
          </li>
          <li>
            There is <b>no fee to you</b> for this. We are paid by the professionals
            in our network, not by you.
          </li>
          <li>
            <b>You choose whether to proceed.</b> Sending this doesn’t commit you to
            working with anyone, and you can decline any contact you receive.
          </li>
        </ul>
        <p className={styles.disclosureLinks}>
          <Link href="/how-matching-works">How matching works</Link> ·{" "}
          <Link href="/privacy">Privacy notice</Link>
        </p>
      </div>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      <button type="submit" className={styles.submit} disabled={submitting}>
        {submitting ? "Sending…" : "Send my request"}
      </button>
    </form>
  );
}
