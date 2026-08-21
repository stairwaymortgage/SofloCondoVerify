"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import styles from "./InquiryModal.module.css";
import { FLOWS } from "@/lib/inquiryFlows";
import type { FlowStep } from "@/lib/inquiryFlows";
import { consentText as CONSENT_TEXT } from "@/lib/disclosures";
import { track } from "@/lib/analytics";

/* ------------------------------------------------------------------ types */

export interface InquiryModalProps {
  /** Flow key — one of the six inquiry intents. */
  intent: string;
  /** Attribution path, e.g. "/buyers". Posted as source_page. */
  sourcePage: string;
  /** Called when the modal closes. */
  onClose: () => void;
}

interface ContactData {
  name: string;
  email: string;
  phone: string;
  wa: string;
  same: boolean;
  company: string;
  note: string;
}

type Answers = Record<string, unknown>;

/* -------------------------------------------------------------- constants */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const COUNTRIES = [
  "Canada",
  "United Kingdom",
  "Brazil",
  "Argentina",
  "Colombia",
  "Mexico",
  "Venezuela",
  "Peru",
  "Chile",
  "Spain",
  "Portugal",
  "Germany",
  "France",
  "Italy",
  "Russia",
  "China",
  "India",
  "United Arab Emirates",
  "Other",
];

const EMPTY_CONTACT: ContactData = {
  name: "",
  email: "",
  phone: "",
  wa: "",
  same: false,
  company: "",
  note: "",
};

/* -------------------------------------------------------------- helpers */

/** Currency formatter — matches the prototype exactly. */
function fmt(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return (
      "$" +
      (m % 1 === 0 ? m : m.toFixed(1)) +
      "M" +
      (n >= 10_000_000 ? "+" : "")
    );
  }
  return "$" + Math.round(n / 1_000) + "K";
}

/** Whether the step's answer is complete enough to advance. */
function checkAnswered(s: FlowStep, a: Answers): boolean {
  const val = a[s.key];
  switch (s.type) {
    case "multi":
    case "slider":
      return true;
    case "single":
      return !!val;
    case "building":
      return !!(
        val &&
        typeof val === "object" &&
        (val as { q: string }).q?.trim()
      );
    case "country":
      return !!val;
    case "contact": {
      const c = val as ContactData | undefined;
      if (!c?.name?.trim()) return false;
      if (!c.email?.trim() && !c.phone?.trim()) return false;
      if (c.email?.trim() && !EMAIL_RE.test(c.email.trim())) return false;
      return true;
    }
    case "consent": {
      const c = val as { tcpa: boolean } | undefined;
      return !!c?.tcpa;
    }
    default:
      return !!val;
  }
}

/* ============================================================ component */

export default function InquiryModal({
  intent,
  sourcePage,
  onClose,
}: InquiryModalProps) {
  /* ---- flow lookup ---- */
  const flow = FLOWS[intent];
  // Defensive: parent should guard, but if the flow is missing, render nothing.
  // All hooks are still called unconditionally below.
  const steps = flow?.steps ?? [];

  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  /* ---- state ---- */
  const [cur, setCur] = useState(0);
  const [ans, setAns] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  /* ---- refs ---- */
  const modalRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = steps[cur] as FlowStep | undefined;

  /* ---- body scroll lock ---- */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* ---- close handler ---- */
  const handleClose = useCallback(() => {
    if (!sent && Object.keys(ans).length > 0) {
      if (!window.confirm("You have unsaved answers. Close anyway?")) return;
    }
    onClose();
  }, [ans, sent, onClose]);

  /* ---- focus management on step change ---- */
  useEffect(() => {
    if (sent) {
      doneRef.current?.focus();
      return;
    }
    const container = stepRef.current;
    if (!container) return;
    requestAnimationFrame(() => {
      const target = container.querySelector<HTMLElement>(
        "button:not([disabled]), input:not([disabled]):not([type='hidden']):not([tabindex='-1']), select:not([disabled]), textarea:not([disabled])"
      );
      if (target) target.focus();
    });
  }, [cur, sent]);

  /* ---- focus trap ---- */
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const focusable = modal!.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [cur, sent]);

  /* ---- keyboard: Escape + Enter ---- */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleClose();
        return;
      }
      if (
        e.key === "Enter" &&
        !sent &&
        !submitting &&
        step &&
        !(e.target instanceof HTMLTextAreaElement) &&
        checkAnswered(step, ans)
      ) {
        e.preventDefault();
        advance(1);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleClose, sent, submitting, step, ans, cur]);

  /* ---- cleanup auto-advance timer on unmount ---- */
  useEffect(() => {
    return () => {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    };
  }, []);

  /* ---- navigation ---- */
  function advance(dir: number) {
    if (autoAdvanceRef.current) {
      clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
    if (dir > 0 && step && !checkAnswered(step, ans)) return;
    const next = cur + dir;
    if (next < 0) return;
    if (next >= steps.length) {
      handleSubmit();
      return;
    }
    setCur(next);
  }

  /* ---- option click ---- */
  function handleOptionClick(s: FlowStep, value: string, isMulti: boolean) {
    if (isMulti) {
      setAns((prev) => {
        const current = Array.isArray(prev[s.key])
          ? [...(prev[s.key] as string[])]
          : [];
        const idx = current.indexOf(value);
        if (idx > -1) current.splice(idx, 1);
        else current.push(value);
        return { ...prev, [s.key]: current };
      });
    } else {
      setAns((prev) => ({ ...prev, [s.key]: value }));
      // Auto-advance after 170ms — matches prototype timing.
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = setTimeout(() => {
        setCur((c) => {
          const next = c + 1;
          return next >= steps.length ? c : next;
        });
      }, 170);
    }
  }

  /* ---- contact update helper ---- */
  function updateContact(field: keyof ContactData, value: string | boolean) {
    setAns((prev) => {
      const current = (prev.contact as ContactData) ?? { ...EMPTY_CONTACT };
      const next = { ...current, [field]: value };
      if (field === "same" && value === true) next.wa = current.phone;
      if (field === "phone" && current.same) next.wa = value as string;
      return { ...prev, contact: next };
    });
  }

  /* ============================================================ submit */
  async function handleSubmit() {
    if (submitting) return;

    const contact = ans.contact as ContactData | undefined;
    if (!contact?.name?.trim()) return;
    if (!contact.email?.trim() && !contact.phone?.trim()) return;

    const consentData = ans.consent as { tcpa: boolean } | undefined;
    // TCPA: non-negotiable. Nothing submits without consent_given === true.
    if (!consentData?.tcpa) return;

    setSubmitting(true);
    setFailure(null);

    // Build qualifier answers — everything except contact and consent, which
    // map to dedicated columns. Include extra contact fields (whatsapp,
    // association/company) that don't have dedicated columns.
    const qualifierAnswers: Record<string, unknown> = {};
    for (const s of steps) {
      if (s.type === "contact" || s.type === "consent") continue;
      if (ans[s.key] !== undefined) {
        qualifierAnswers[s.key] = ans[s.key];
      }
    }
    if (contact.wa) qualifierAnswers.whatsapp = contact.wa;
    if (contact.company)
      qualifierAnswers.association_company = contact.company;

    // Extract building name for the dedicated building field.
    const buildingData = ans.building as { q: string } | undefined;
    const buildingName = buildingData?.q?.trim() || "";

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: flow.intent,
          name: contact.name.trim(),
          email: contact.email.trim(),
          phone: contact.phone.trim(),
          message: contact.note?.trim() || "",
          // Honeypot: always empty from the modal, same as InquiryForm.
          company: "",
          // Only reachable when consentData.tcpa === true — see guard above.
          consent_given: true,
          // The wording shown beside the box, sent with the tick so a later
          // reissue cannot change what an already-captured lead agreed to.
          consent_text: CONSENT_TEXT,
          // Attribution key — lands in leads.source_page and the GHL custom
          // field, exactly as InquiryForm sends today.
          source_page: sourcePage,
          // Building name for GHL building_name custom field and message.
          building: buildingName,
          // All qualifier answers as JSONB.
          answers: qualifierAnswers,
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok) {
        // Input is kept — a failure must never cost someone their answers.
        setFailure(
          payload.error ?? "Something went wrong. Please try again."
        );
        return;
      }

      setSent(true);
      track("connect_submitted", {
        intent: flow.intent,
        source_page: sourcePage,
      });
    } catch {
      setFailure("We couldn\u2019t reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ---- overlay click (outside modal) ---- */
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) handleClose();
  }

  /* ============================================================ render */

  if (!flow) return null;

  const pct = sent ? 100 : Math.round((cur / steps.length) * 100);

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        className={styles.modal}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={flow.tag}
      >
        {/* ---- head ---- */}
        <div className={styles.head}>
          <button
            className={styles.close}
            onClick={handleClose}
            aria-label="Close"
            type="button"
          >
            &times;
          </button>
          <div className={styles.tag}>{flow.tag}</div>
          <div className={styles.prog}>
            <span>
              {sent ? "Sent" : `Step ${cur + 1} of ${steps.length}`}
            </span>
            <span>{pct}%</span>
          </div>
          <div className={styles.bar}>
            <div className={styles.fill} style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* ---- body ---- */}
        {sent ? (
          <div className={styles.body}>
            <div
              className={`${styles.step} ${styles.done}`}
              ref={doneRef}
              tabIndex={-1}
            >
              <div className={styles.doneRing}>
                <svg viewBox="0 0 24 24" width="32" height="32">
                  <path
                    d="M4 12l5 5L20 6"
                    stroke="#fff"
                    strokeWidth="2.6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className={styles.question}>
                Request sent
                {(ans.contact as ContactData | undefined)?.name
                  ? `, ${(ans.contact as ContactData).name.trim().split(" ")[0]}`
                  : ""}
                .
              </div>
              <p className={styles.doneBody}>
                We&apos;ll pass this to a licensed professional in our network
                who handles {flow.tag.toLowerCase()} requests. They&apos;ll
                reach out directly &mdash; no fee, no obligation.
              </p>
              <div className={styles.whatNext}>
                <h4 className={styles.whatNextHead}>What happens next</h4>
                <ol className={styles.whatNextList}>
                  <li>Your request is in. No account, no fee.</li>
                  <li>
                    We pass it to one or more licensed professionals who handle
                    your kind of request.
                  </li>
                  <li>
                    They contact you directly. You decide whether to go further
                    &mdash; with any of them, or none.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.body} ref={stepRef}>
              <div className={styles.step} key={cur}>
                {step && renderStep(step)}
              </div>
            </div>
            <div className={styles.foot}>
              <button
                className={styles.back}
                onClick={() => advance(-1)}
                disabled={cur === 0}
                type="button"
              >
                &larr; Back
              </button>
              <button
                className={styles.next}
                onClick={() => advance(1)}
                disabled={
                  !step || !checkAnswered(step, ans) || submitting
                }
                type="button"
              >
                {submitting
                  ? "Sending\u2026"
                  : step?.type === "consent"
                    ? "Send my request"
                    : "Continue"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  /* ============================================================ step renderers */

  function renderStep(s: FlowStep) {
    return (
      <>
        {s.eye && <div className={styles.eye}>{s.eye}</div>}
        <div className={styles.question}>{s.q}</div>
        {s.sub && <div className={styles.stepSub}>{s.sub}</div>}
        {renderStepContent(s)}
      </>
    );
  }

  function renderStepContent(s: FlowStep) {
    switch (s.type) {
      case "single":
      case "multi":
        return renderOptions(s);
      case "slider":
        return renderSlider(s);
      case "building":
        return renderBuilding(s);
      case "country":
        return renderCountry(s);
      case "contact":
        return renderContact(s);
      case "consent":
        return renderConsent(s);
    }
  }

  /* ---- single / multi options ---- */
  function renderOptions(s: FlowStep) {
    if (!s.options) return null;
    const isMulti = s.type === "multi";
    const twoCol = s.options.length > 4;
    const selected = ans[s.key];

    return (
      <div className={twoCol ? styles.optsTwo : styles.opts}>
        {s.options.map(([label, desc]) => {
          const isSel = isMulti
            ? Array.isArray(selected) && selected.includes(label)
            : selected === label;

          return (
            <button
              key={label}
              className={`${styles.opt} ${isSel ? styles.optSel : ""}`}
              onClick={() => handleOptionClick(s, label, isMulti)}
              type="button"
            >
              <span className={styles.optContent}>
                <span className={styles.optPrimary}>{label}</span>
                {desc && (
                  <span className={styles.optSecondary}>{desc}</span>
                )}
              </span>
              <span
                className={`${styles.tick} ${isMulti ? styles.tickMulti : ""} ${isSel ? styles.tickSel : ""}`}
              >
                <svg
                  className={`${styles.tickIcon} ${isSel ? styles.tickIconVis : ""}`}
                  viewBox="0 0 12 12"
                >
                  <path
                    d="M2 6l3 3 5-6"
                    stroke="#fff"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  /* ---- slider ---- */
  function renderSlider(s: FlowStep) {
    const value = (ans[s.key] as number) ?? s.start ?? 0;
    return (
      <>
        <div className={styles.sliderVal}>{fmt(value)}</div>
        <input
          type="range"
          className={styles.slider}
          min={s.min}
          max={s.max}
          step={s.step}
          value={value}
          onChange={(e) =>
            setAns((prev) => ({ ...prev, [s.key]: Number(e.target.value) }))
          }
          aria-label={s.q}
        />
        <div className={styles.sliderEnds}>
          <span>{fmt(s.min ?? 0)}</span>
          <span>{fmt(s.max ?? 0)}</span>
        </div>
      </>
    );
  }

  /* ---- building text input ---- */
  function renderBuilding(s: FlowStep) {
    const data = (ans[s.key] as { q: string }) ?? { q: "" };
    return (
      <>
        <div className={styles.fieldWrap}>
          <input
            type="text"
            id={id("building")}
            className={styles.input}
            placeholder="Building name, address, or ZIP"
            value={data.q}
            onChange={(e) =>
              setAns((prev) => ({
                ...prev,
                [s.key]: { q: e.target.value },
              }))
            }
            autoComplete="off"
          />
        </div>
        <div className={styles.hint}>
          e.g. Brickell Flatiron &middot; Porsche Design Tower &middot; 33160
        </div>
      </>
    );
  }

  /* ---- country dropdown ---- */
  function renderCountry(s: FlowStep) {
    const value = (ans[s.key] as string) ?? "";
    return (
      <div className={styles.fieldWrap}>
        <select
          id={id("country")}
          className={styles.select}
          value={value}
          onChange={(e) =>
            setAns((prev) => ({ ...prev, [s.key]: e.target.value }))
          }
        >
          <option value="">Select country&hellip;</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    );
  }

  /* ---- contact step ---- */
  function renderContact(s: FlowStep) {
    const data = (ans.contact as ContactData) ?? { ...EMPTY_CONTACT };

    return (
      <>
        <div className={styles.fieldWrap}>
          <label className={styles.fieldLabel} htmlFor={id("c-name")}>
            Your name
            <span className={styles.reqTag}>required</span>
          </label>
          <input
            type="text"
            id={id("c-name")}
            className={styles.input}
            placeholder="First and last"
            value={data.name}
            onChange={(e) => updateContact("name", e.target.value)}
            autoComplete="name"
          />
        </div>

        <div className={styles.fieldWrap}>
          <label className={styles.fieldLabel} htmlFor={id("c-email")}>
            Email
          </label>
          <input
            type="email"
            id={id("c-email")}
            className={styles.input}
            placeholder="you@email.com"
            value={data.email}
            onChange={(e) => updateContact("email", e.target.value)}
            autoComplete="email"
            inputMode="email"
          />
        </div>

        <div className={styles.fieldWrap}>
          <label className={styles.fieldLabel} htmlFor={id("c-phone")}>
            Phone
          </label>
          <input
            type="tel"
            id={id("c-phone")}
            className={styles.input}
            placeholder="(000) 000-0000"
            value={data.phone}
            onChange={(e) => updateContact("phone", e.target.value)}
            autoComplete="tel"
            inputMode="tel"
          />
        </div>

        {s.whatsapp && (
          <div className={styles.fieldWrap}>
            <label className={styles.fieldLabel} htmlFor={id("c-wa")}>
              WhatsApp
              <span className={styles.optionalTag}>optional</span>
            </label>
            <input
              type="tel"
              id={id("c-wa")}
              className={styles.input}
              placeholder="+.. .. ...."
              value={data.wa}
              onChange={(e) => updateContact("wa", e.target.value)}
              disabled={data.same}
            />
            <label className={styles.checkrow}>
              <input
                type="checkbox"
                checked={data.same}
                onChange={(e) => updateContact("same", e.target.checked)}
              />
              Same as phone
            </label>
          </div>
        )}

        {s.company && (
          <div className={styles.fieldWrap}>
            <label className={styles.fieldLabel} htmlFor={id("c-co")}>
              Association / company
              <span className={styles.optionalTag}>optional</span>
            </label>
            <input
              type="text"
              id={id("c-co")}
              className={styles.input}
              placeholder="Association or management company"
              value={data.company}
              onChange={(e) => updateContact("company", e.target.value)}
            />
          </div>
        )}

        <div className={styles.hint}>
          Give us an email or a phone number &mdash; whichever you&apos;d
          rather be reached on. One is enough.
        </div>

        <div className={styles.fieldWrap}>
          <label className={styles.fieldLabel} htmlFor={id("c-note")}>
            Anything else we should pass along?
            <span className={styles.optionalTag}>optional</span>
          </label>
          <textarea
            id={id("c-note")}
            className={styles.textarea}
            placeholder="Optional"
            value={data.note}
            onChange={(e) => updateContact("note", e.target.value)}
          />
        </div>

        {/* Honeypot — off-screen and never focusable. */}
        <div className={styles.hp} aria-hidden>
          <label htmlFor={id("company")}>Company</label>
          <input
            id={id("company")}
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
      </>
    );
  }

  /* ---- consent step ---- */
  function renderConsent(s: FlowStep) {
    const data = (ans[s.key] as { tcpa: boolean }) ?? { tcpa: false };

    return (
      <>
        <div className={styles.consentPanel}>
          <h4 className={styles.consentHead}>
            What happens when you send this
          </h4>
          <ul className={styles.consentList}>
            <li>
              Your request &mdash; including your contact details &mdash;{" "}
              <b>
                may be shared with one or more licensed professionals
              </b>{" "}
              in our network so they can respond to you.
            </li>
            <li>
              There is <b>no fee to you</b>. We are paid by the professionals
              in our network, not by you.
            </li>
            <li>
              <b>You choose whether to proceed.</b> Sending this doesn&apos;t
              commit you to anyone, and you can decline any contact.
            </li>
          </ul>
        </div>

        {/* TCPA consent — starts unticked, never pre-checked. The checkbox
            is the gate: nothing submits without consent_given === true. */}
        <label className={styles.tcpa}>
          <input
            type="checkbox"
            checked={data.tcpa}
            onChange={(e) =>
              setAns((prev) => ({
                ...prev,
                [s.key]: { tcpa: e.target.checked },
              }))
            }
            id={id("tcpa")}
          />
          <span>
            <span className={styles.reqTag}>Required.</span> {CONSENT_TEXT}
          </span>
        </label>

        {failure && (
          <div className={styles.error} role="alert">
            {failure}
          </div>
        )}
      </>
    );
  }
}
