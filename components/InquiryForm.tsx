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
  /**
   * TCPA consent wording, rendered beside the required consent checkbox.
   *
   * Passed in per page for the same reason as `disclosure`: this component
   * renders consent language, it never authors it. Every audience page passes
   * the one shared `consentText` from lib/disclosures.ts — a page must not
   * supply a variant, because this exact string is what the tick attests to.
   */
  consentText: string;
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

/**
 * Shown when a submission is attempted with the consent box unticked. The
 * button is disabled until it is ticked, so this is the belt to that braces —
 * it catches implicit submission (Enter in a field) and anything scripted.
 */
const CONSENT_REQUIRED =
  "Please tick the consent box above so we can contact you about your inquiry.";

const DEFAULT_SUCCESS_HEADING = "Request received.";
/**
 * Deliberately says nothing it cannot keep. No name, because leads route to
 * different people by intent and the person who calls is not known here; no
 * timeframe, because nothing in this component can commit to one; and no
 * outcome, because the answer is a licensed conversation, not a result this
 * form can promise.
 */
const DEFAULT_SUCCESS_MESSAGE =
  "Thank you — we’ve got your request. A licensed specialist on our team will reach out to you personally. Nothing more you need to do.";

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
  consentText,
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
  // TCPA. Starts false and is never defaulted true anywhere: a pre-ticked box
  // is not consent, and this is the one field where that distinction is the
  // whole point of the field.
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);

  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
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

    // No consent, no send. Checked after the field errors so someone who has
    // both problems is told about the fields first and the consent second,
    // rather than being sent back to the top twice.
    if (!consent) {
      setConsentError(CONSENT_REQUIRED);
      consentRef.current?.focus();
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
          // Unreachable as false — handleSubmit returns above without it — so
          // this records the tick rather than reporting a state.
          consent_given: consent,
          // The wording actually shown beside the box, sent with the tick. It
          // is stored alongside it so a later reissue of consentText cannot
          // change what an already-captured lead appears to have agreed to.
          consent_text: consentText,
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

      {/* The label wraps the whole consent statement, so the hit area is the
          sentence rather than an 18px square, and the wording that is ticked
          is the wording that is read. */}
      <div
        className={styles.consent}
        data-invalid={consentError ? "true" : undefined}
      >
        <input
          id={id("consent")}
          ref={consentRef}
          type="checkbox"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked);
            if (e.target.checked) setConsentError(null);
          }}
          aria-invalid={consentError ? true : undefined}
          aria-describedby={consentError ? id("consent-error") : undefined}
        />
        <label htmlFor={id("consent")} className={styles.consentBody}>
          <span className={styles.req}>required</span>
          <span className={styles.consentText}>{consentText}</span>
        </label>
      </div>

      {consentError && (
        <div className={styles.error} id={id("consent-error")} role="alert">
          {consentError}
        </div>
      )}

      {failure && (
        <div className={styles.error} role="alert">
          {failure}
        </div>
      )}

      <button
        type="submit"
        className={styles.submit}
        disabled={submitting || !consent}
      >
        {submitting ? "Sending…" : buttonLabel}
      </button>
    </form>
  );
}
