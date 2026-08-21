"use client";

import { useState } from "react";
import styles from "./ConnectCta.module.css";
import InquiryModal from "./InquiryModal";

export interface ConnectAction {
  intent: string;
  label: string;
}

interface Props {
  lede: string;
  actions: ConnectAction[];
  /** Attribution path, e.g. "/buyers". */
  sourcePage: string;
}

/**
 * The same "Get connected — free" sidebar card as ConnectCta, but buttons
 * open the multi-step inquiry modal instead of navigating to /connect.
 *
 * Reuses ConnectCta.module.css identically — only the click behaviour
 * changes.
 */
export default function ConnectCtaModal({ lede, actions, sourcePage }: Props) {
  const [inquiry, setInquiry] = useState<string | null>(null);

  return (
    <div className={styles.cta}>
      <div className={styles.ctaHead}>Get connected — free</div>
      <div className={styles.ctaBody}>
        <p className={styles.ctaLede}>{lede}</p>
        <div className={styles.ctaBtns}>
          {actions.map((action, index) => (
            <button
              key={action.intent}
              className={
                index === 0 ? styles.btnPrimary : styles.btnSecondary
              }
              onClick={() => setInquiry(action.intent)}
              type="button"
            >
              {action.label}
            </button>
          ))}
        </div>
        <p className={styles.ctaFine}>
          Free &middot; no account required &middot; no obligation
        </p>
      </div>
      {inquiry && (
        <InquiryModal
          intent={inquiry}
          sourcePage={sourcePage}
          onClose={() => setInquiry(null)}
        />
      )}
    </div>
  );
}
