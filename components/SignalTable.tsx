import type { Signal } from "@/lib/signals";
import styles from "./SignalTable.module.css";

interface Props {
  signals: Signal[];
  caption: string;
  /** Mark the leading flag/caution rows — used by the due-diligence read. */
  markAttention?: boolean;
}

/** The seven-signal record, in whatever order the caller hands it over. */
export default function SignalTable({ signals, caption, markAttention }: Props) {
  return (
    // Three columns of status text don't compress below roughly 400px, so on
    // a phone the table scrolls within this box instead of taking the page
    // with it. tabIndex makes the scroll area keyboard-reachable, and the
    // role/label stop a focusable div being an unnamed stop for a screen
    // reader.
    <div
      className="tscroll"
      tabIndex={0}
      role="region"
      aria-label={caption}
    >
      <table className={styles.sig}>
        <caption className={styles.caption}>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Signal</th>
            <th scope="col">Status</th>
            <th scope="col">As of</th>
          </tr>
        </thead>
        <tbody>
          {signals.map((signal) => {
            const attention =
              markAttention && (signal.tone === "flag" || signal.tone === "caution");

            return (
              <tr key={signal.name} className={attention ? styles.lead : undefined}>
                <th scope="row" className={styles.snm}>
                  {signal.name}
                  <span className={`${styles.srcx} mono`}>{signal.source}</span>
                  {attention && (
                    <span className={styles.leadMark}>Worth looking into</span>
                  )}
                </th>
                <td>
                  <span className={`${styles.status} ${styles[`s_${signal.tone}`]}`}>
                    <span className={styles.sq} aria-hidden /> {signal.value}
                  </span>
                </td>
                <td className={`${styles.asof} mono`}>{signal.asOf}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** How to read a status — the same key on every page that shows the table. */
export function SignalLegend() {
  return (
    <div className={styles.legend}>
      <div className={styles.legendHead}>How to read a status</div>
      <ul>
        <LegendItem tone="go" label="Approved / cleared in the record" />
        <LegendItem tone="flag" label="Rejected or revoked" />
        <LegendItem tone="caution" label="Unconfirmed — worth checking" />
        <LegendItem tone="none" label="Nothing on file / informational" />
      </ul>
    </div>
  );
}

function LegendItem({ tone, label }: { tone: string; label: string }) {
  return (
    <li>
      <span className={`${styles.legendSq} ${styles[`s_${tone}`]}`} aria-hidden />
      {label}
    </li>
  );
}
