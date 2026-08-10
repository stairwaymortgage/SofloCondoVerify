import Link from "next/link";
import styles from "./Masthead.module.css";

export default function Masthead() {
  return (
    <>
      <div className={styles.authstrip}>
        <div className="wrap">
          <span className={styles.fi} aria-hidden />
          <span>
            An independent condo verification record for <b>South Florida</b>
          </span>
          <span className={`${styles.right} mono`}>
            Sourced from HUD · VA · FL DBPR · county registries
          </span>
        </div>
      </div>
      <header className={styles.mast}>
        <div className={`wrap ${styles.inner}`}>
          <Link href="/" className={styles.brand}>
            <span className={styles.seal} aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 2l7 3.5v6c0 5-3.4 8-7 10-3.6-2-7-5-7-10v-6z" />
                <path d="M9 12l2 2 4-4.5" />
              </svg>
            </span>
            <span className={styles.wm}>
              <span className={styles.t}>
                SoFloCondo<span>Verify</span>
              </span>
              <span className={styles.s}>Condo Verification Record</span>
            </span>
          </Link>
          <nav className={styles.links}>
            <Link href="/">Look up</Link>
            <Link href="/preconstruction">Preconstruction</Link>
            <Link href="/#buyers">Buyers</Link>
            <Link href="/#sellers">Sellers</Link>
            <Link href="/#foreign">Foreign buyers</Link>
            <Link href="/advertise" className={styles.cta}>
              Advertise with us
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
