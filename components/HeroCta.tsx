"use client";

import { useState } from "react";
import styles from "./HeroCta.module.css";
import InquiryModal from "./InquiryModal";

export interface HeroCtaProps {
  /** Flow key — one of the six inquiry intents. */
  intent: string;
  /** Attribution path, e.g. "/buyers". Passed through to /api/leads. */
  sourcePage: string;
  /** Button label, set per page. */
  label: string;
  /** Fine print below the button, set per page. */
  fine: string;
}

/**
 * Hero-level CTA button + fine print that opens the multi-step inquiry
 * modal. Identical visuals on all six pages — matches the button already
 * shipping on /for-boards.
 *
 * Client component: owns the open/close state for InquiryModal.
 */
export default function HeroCta({
  intent,
  sourcePage,
  label,
  fine,
}: HeroCtaProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={styles.heroBtn}
        onClick={() => setOpen(true)}
        type="button"
      >
        {label}
      </button>
      <div className={styles.heroFine}>{fine}</div>
      {open && (
        <InquiryModal
          intent={intent}
          sourcePage={sourcePage}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
