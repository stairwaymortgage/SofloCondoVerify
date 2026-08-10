import Link from "next/link";
import Masthead from "@/components/Masthead";
import styles from "./not-found.module.css";

/** Covers the index and every company page below it. */
export default function DeveloperNotFound() {
  return (
    <>
      <Masthead />
      <section className={styles.page}>
        <div className="wrap">
          <div className={styles.card}>
            <div className={`${styles.doc} mono`}>Company 404</div>
            <h1>No company on file</h1>
            <p>
              That address doesn’t match any developer, architect or design firm we
              track. The link may be mistyped, or the company may have been renamed
              in a monthly refresh.
            </p>
            <Link href="/developers" className={styles.btn}>
              Browse all companies
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
