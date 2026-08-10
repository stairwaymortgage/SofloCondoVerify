import Link from "next/link";
import Masthead from "@/components/Masthead";
import styles from "./not-found.module.css";

/** Covers the index, city listings and association records. */
export default function AssociationNotFound() {
  return (
    <>
      <Masthead />
      <section className={styles.page}>
        <div className="wrap">
          <div className={styles.card}>
            <div className={`${styles.doc} mono`}>Registry 404</div>
            <h1>No registry entry here</h1>
            <p>
              That city or association doesn’t match anything in the registry file
              we hold. The link may be mistyped, or the entry may have changed in a
              refresh.
            </p>
            <Link href="/associations" className={styles.btn}>
              Browse the registry by city
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
