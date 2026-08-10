import Link from "next/link";
import styles from "./Breadcrumbs.module.css";

export interface Crumb {
  name: string;
  /** Omitted on the current page. */
  href?: string;
}

/**
 * Home > County > City > page. Rendered as a nav so the trail is announced,
 * and mirrored as BreadcrumbList JSON-LD by each page.
 */
export default function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  return (
    <nav className={`${styles.crumb} mono`} aria-label="Breadcrumb">
      {trail.map((crumb, index) => (
        <span key={`${crumb.name}-${index}`}>
          {index > 0 && <span className={styles.sep}> / </span>}
          {crumb.href ? (
            <Link href={crumb.href}>{crumb.name}</Link>
          ) : (
            <span aria-current="page">{crumb.name}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
