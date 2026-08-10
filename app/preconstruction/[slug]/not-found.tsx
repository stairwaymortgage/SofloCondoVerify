import Link from "next/link";
import Masthead from "@/components/Masthead";
import styles from "./not-found.module.css";

export default function PreconNotFound() {
  return (
    <>
      <Masthead />
      <section className={styles.page}>
        <div className="wrap">
          <div className={`${styles.crumb} mono`}>
            <Link href="/">Home</Link> /{" "}
            <Link href="/preconstruction">Preconstruction</Link> / Not found
          </div>
          <div className={styles.card}>
            <div className={`${styles.doc} mono`}>Project 404</div>
            <h1>No project on file</h1>
            <p>
              That address doesn’t match any preconstruction project we track. The
              link may be mistyped, or the project may have been renamed in a
              monthly refresh.
            </p>
            <Link href="/preconstruction" className={styles.btn}>
              Browse all preconstruction projects
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
