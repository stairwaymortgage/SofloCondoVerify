import Link from "next/link";
import styles from "./SiteFooter.module.css";

/**
 * One footer for every page. It was duplicated inline across a dozen routes;
 * the matching and privacy links needed to appear on all of them, which is
 * reason enough to have a single copy.
 */
export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.inner}`}>
        <nav className={styles.links} aria-label="Site information">
          <Link href="/how-matching-works">How matching works</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/rules">Rules</Link>
          <Link href="/for-boards">For boards</Link>
          <Link href="/advertise">Advertise with us</Link>
        </nav>
        <div className={styles.lines}>
          <div>© 2026 SoFloCondoVerify.com · Miami-Dade · Broward · Palm Beach</div>
          <div>
            Independent record · Ads are labeled “Advertisement” · Not legal or
            financial advice · Not affiliated with any government agency
          </div>
        </div>
      </div>
    </footer>
  );
}
