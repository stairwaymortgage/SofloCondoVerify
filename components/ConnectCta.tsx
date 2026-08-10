import Link from "next/link";
import styles from "./ConnectCta.module.css";

export interface ConnectAction {
  /** One of the four lead intents — see lib/intents.ts. */
  intent: string;
  label: string;
}

interface Props {
  lede: string;
  /** First action is the primary button. */
  actions: ConnectAction[];
  /** buildings.id or a precon url_slug, passed through as ?record=. */
  record?: string | number | null;
}

/** The "Get connected — free" card, shared by every record-style page. */
export default function ConnectCta({ lede, actions, record }: Props) {
  const suffix =
    record === null || record === undefined
      ? ""
      : `&record=${encodeURIComponent(String(record))}`;

  return (
    <div className={styles.cta}>
      <div className={styles.ctaHead}>Get connected — free</div>
      <div className={styles.ctaBody}>
        <p className={styles.ctaLede}>{lede}</p>
        <div className={styles.ctaBtns}>
          {actions.map((action, index) => (
            <Link
              key={action.intent}
              className={index === 0 ? styles.btnPrimary : styles.btnSecondary}
              href={`/connect?intent=${action.intent}${suffix}`}
            >
              {action.label}
            </Link>
          ))}
        </div>
        <p className={styles.ctaFine}>Free · no account required · no obligation</p>
      </div>
    </div>
  );
}
