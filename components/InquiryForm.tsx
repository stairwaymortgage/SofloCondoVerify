"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./InquiryForm.module.css";
import { track } from "@/lib/analytics";
import type { IntentValue } from "@/lib/intents";

export interface InquiryFormProps {
  /**
   * Which page this lead came from, as a site-root path — "/buyers",
   * "/preconstruction". It is posted as `source_page` and is the attribution
   * key: it lands in leads.source_page in Supabase and in the source_page
   * custom field on the GHL contact.
   *
   * It must start with "/" and contain only path characters. /api/leads
   * validates the shape and stores null for anything else, so a bare
   * "buyers" would silently cost you the attribution.
   */
  source: string;
  /**
   * What the lead is about. /api/leads rejects the submission outright if
   * this is not one of the five known intents, and routeLead() uses it to
   * stamp the routing tier server-side.
   */
  intent: IntentValue;
  /** Form heading. Set per page — this component writes no page copy. */
  heading: string;
  /** Submit button wording. Set per page. */
  buttonLabel: string;
  /**
   * Compliance-reviewed disclosure, rendered directly above the submit
   * button. Passed in per page on purpose: this component must never be the
   * place disclosure wording is authored or edited.
   */
  disclosure: string;
  /** Optional overrides for the in-place confirmation. */
  successHeading?: string;
  successMessage?: string;
}

type FieldName = "name" | "email" | "phone";
type Errors = Partial<Record<FieldName, string>>;

/**
 * Mirrors the server's rule in /api/leads deliberately — the server stays the
 * authority and re-checks everything, this is only here so someone finds out
 * before a round trip. Loose on purpose: just enough to catch a typo.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const DEFAULT_SUCCESS_HEADING = "Request received.";
const DEFAULT_SUCCESS_MESSAGE =
  "It has been passed to our network. Someone licensed to handle it will reach out directly — there is nothing else for you to do.";

/**
 * The shared lead-capture form for the audience pages.
 *
 * It owns no delivery logic. Everything it collects is posted to /api/leads,
 * which is the single place that writes to Supabase and pushes to GoHighLevel;
 * this component only decides what to send and what to say while sending.
 */
export default function InquiryForm({
  source,
  intent,
  heading,
  buttonLabel,
  disclosure,
  successHeading = DEFAULT_SUCCESS_HEADING,
  successMessage = DEFAULT_SUCCESS_MESSAGE,
}: InquiryFormProps) {
  const uid = useId();
  const id = (field: string) => `${uid}-${field}`;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot

  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  const refs: Record<FieldName, React.RefObject<HTMLInputElement>> = {
    name: nameRef,
    email: emailRef,
    phone: phoneRef,
  };

  // The form is replaced in place, so without this the focus ring would be
  // left on a button that no longer exists and a screen reader would have no
  // idea anything happened.
  useEffect(() => {
    if (sent) doneRef.current?.focus();
  }, [sent]);

  function validate(): Errors {
    const found: Errors = {};

    if (name.trim().length < 2) {
      found.name = "Enter your name.";
    }

    // Either channel will do, but one of them is required — the same rule the
    // server enforces, worded the same way.
    if (!email.trim() && !phone.trim()) {
      found.email = "Enter an email address or a phone number so we can reply.";
    } else if (email.trim() && !EMAIL.test(email.trim())) {
      found.email = "That email address doesn’t look right.";
    }

    return found;
  }

  /** Clear a field's error as soon as it is edited, not on the next submit. */
  function edit(field: FieldName, value: string, set: (v: string) => void) {
    set(value);
    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return; // no double submit

    const found = validate();
    setErrors(found);

    // Nothing goes out while the form is invalid; focus lands on the first
    // problem so the reason is where the cursor is.
    const firstBad = (["name", "email", "phone"] as FieldName[]).find(
      (field) => found[field]
    );
    if (firstBad) {
      refs[firstBad].current?.focus();
      return;
    }

    setSubmitting(true);
    setFailure(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
          company,
          // The attribution key. Supabase stores it on the row; GHL gets it as
          // the source_page custom field and in the note.
          source_page: source,
        }),
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok) {
        // Input is left exactly as typed — a failure here must never cost
        // someone the message they just wrote.
        setFailure(
          payload.error ?? "Something went wrong. Please try again."
        );
        return;
      }

      setSent(true);

      // Accepted leads only, and no contact details: the page and the intent
      // are the whole of what attribution needs.
      track("connect_submitted", { intent, source_page: source });
    } catch {
      setFailure("We couldn’t reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Success replaces the form in place — no navigation, and focus moves here
  // so a screen reader lands on the confirmation rather than the page top.
  if (sent) {
    return (
      <div
        className={styles.done}
        ref={doneRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
      >
        <div className={`${styles.doneKicker} mono`}>Sent</div>
        <h2 className={styles.doneHead}>{successHeading}</h2>
        <p className={styles.doneBody}>{successMessage}</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.heading}>{heading}</h2>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor={id("name")}>
            Your name <span className={styles.req}>required</span>
          </label>
          <input
            id={id("name")}
            ref={nameRef}
            type="text"
            value={name}
            onChange={(e) => edit("name", e.target.value, setName)}
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? id("name-error") : undefined}
          />
          {errors.name && (
            <span className={styles.fieldError} id={id("name-error")}>
              {errors.name}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor={id("email")}>Email</label>
          <input
            id={id("email")}
            ref={emailRef}
            type="email"
            value={email}
            onChange={(e) => edit("email", e.target.value, setEmail)}
            autoComplete="email"
            inputMode="email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? id("email-error") : undefined}
          />
          {errors.email && (
            <span className={styles.fieldError} id={id("email-error")}>
              {errors.email}
            </span>
          )}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor={id("phone")}>Phone</label>
          <input
            id={id("phone")}
            ref={phoneRef}
            type="tel"
            value={phone}
            onChange={(e) => edit("phone", e.target.value, setPhone)}
            autoComplete="tel"
            inputMode="tel"
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? id("phone-error") : undefined}
          />
          {errors.phone && (
            <span className={styles.fieldError} id={id("phone-error")}>
              {errors.phone}
            </span>
          )}
        </div>
        <div className={styles.fieldNote}>
          An email or a phone number — whichever you’d rather be reached on.
          One is enough.
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor={id("message")}>
          Anything else we should pass along?{" "}
          <span className={styles.opt}>optional</span>
        </label>
        <textarea
          id={id("message")}
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {/* Honeypot: off-screen and never focusable, so a value means a bot.
          /api/leads accepts-and-drops those silently. */}
      <div className={styles.hp} aria-hidden>
        <label htmlFor={id("company")}>Company</label>
        <input
          id={id("company")}
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className={styles.disclosure}>{disclosure}</div>

      {failure && (
        <div className={styles.error} role="alert">
          {failure}
        </div>
      )}

      <button type="submit" className={styles.submit} disabled={submitting}>
        {submitting ? "Sending…" : buttonLabel}
      </button>
    </form>
  );
}
