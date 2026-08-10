import Link from "next/link";
import Masthead from "@/components/Masthead";
import { COUNTIES } from "@/lib/cities";
import styles from "./not-found.module.css";

/** Covers county, city and FAQ routes — the nearest boundary for all three. */
export default function CondosNotFound() {
  return (
    <>
      <Masthead />
      <section className={styles.page}>
        <div className="wrap">
          <div className={styles.card}>
            <div className={`${styles.doc} mono`}>Page 404</div>
            <h1>Not in our file</h1>
            <p>
              That county, city or answer doesn’t match anything we hold. We cover
              Miami-Dade, Broward and Palm Beach — start from a county below, or
              look up a specific building.
            </p>
            <div className={styles.links}>
              {COUNTIES.map((county) => (
                <Link
                  key={county.slug}
                  href={`/condos/${county.slug}`}
                  className={styles.btn}
                >
                  {county.name} County
                </Link>
              ))}
            </div>
            <Link href="/" className={styles.plain}>
              Back to the lookup
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
