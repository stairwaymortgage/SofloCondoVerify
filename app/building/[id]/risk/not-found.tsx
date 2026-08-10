import Link from "next/link";
import Masthead from "@/components/Masthead";
import styles from "./not-found.module.css";

export default function RiskNotFound() {
  return (
    <>
      <Masthead />
      <section className={styles.page}>
        <div className="wrap">
          <div className={`${styles.crumb} mono`}>
            <Link href="/">Home</Link> / Condo verification lookup / Due-diligence
            read
          </div>
          <div className={styles.card}>
            <div className={`${styles.doc} mono`}>No read on file</div>
            <h1>Nothing stacked up to read</h1>
            <p>
              We publish a due-diligence read for tri-county buildings carrying two
              or more flagged signals. This record either isn’t one of them, or the
              record number doesn’t match a building in our file — in both cases
              the verification record is the page you want.
            </p>
            <Link href="/" className={styles.btn}>
              Back to the lookup
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
