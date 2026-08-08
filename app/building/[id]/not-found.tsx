import Link from "next/link";
import Masthead from "@/components/Masthead";
import styles from "./not-found.module.css";

export default function BuildingNotFound() {
  return (
    <>
      <Masthead />
      <section className={styles.page}>
        <div className="wrap">
          <div className={`${styles.crumb} mono`}>
            <Link href="/">Home</Link> / Condo verification lookup / Not found
          </div>
          <div className={styles.card}>
            <div className={`${styles.doc} mono`}>Record 404</div>
            <h1>No record on file</h1>
            <p>
              That record number doesn’t match any building in our file. It may have
              been removed in a monthly refresh, or the link may be mistyped.
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
