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
  /**
   * Visual variant.
   * - "dark" (default): hero sits on --mast background — button is light
   *   teal on dark. Used by /buyers, /sellers, /foreign-buyers, /for-boards.
   * - "light": hero sits on --panel background — button is solid teal on
   *   white. Used by /preconstruction, /associations.
   */
  variant?: "dark" | "light";
}

/**
 * Hero-level CTA button + fine print that opens the multi-step inquiry
 * modal. The most prominent action in the hero on all six pages.
 *
 * Client component: owns the open/close state for InquiryModal.
 */
export default function HeroCta({
  intent,
  sourcePage,
  label,
  fine,
  variant = "dark",
}: HeroCtaProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={
          variant === "light" ? styles.heroBtnLight : styles.heroBtn
        }
        onClick={() => setOpen(true)}
        type="button"
      >
        {label}
      </button>
      <div
        className={
          variant === "light" ? styles.heroFineLight : styles.heroFine
        }
      >
        {fine}
      </div>
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
