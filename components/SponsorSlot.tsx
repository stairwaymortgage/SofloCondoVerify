import {
  getSponsors,
  sponsorHref,
  sponsorInitials,
  sponsorRole,
  type SponsorPage,
  type SponsorVariant,
} from "@/lib/sponsors";
import type { Sponsor } from "@/lib/database.types";
import styles from "./SponsorSlot.module.css";

interface Props {
  page: SponsorPage;
  /** leaderboard across the content column, or card in a sidebar. */
  variant?: SponsorVariant;
}

/**
 * A labeled advertising unit.
 *
 * The "Advertisement" header is not optional and not conditional — if there is
 * nothing to show, the whole unit renders nothing rather than an unlabeled
 * one. Callers place this ALONGSIDE the neutral ConnectCta, never instead of
 * it.
 */
export default async function SponsorSlot({ page, variant = "card" }: Props) {
  const sponsors = await getSponsors(page);
  if (sponsors.length === 0) return null;

  return (
    <aside
      className={`${styles.slot} ${variant === "leaderboard" ? styles.board : styles.card}`}
      aria-label="Advertisement"
    >
      <div className={styles.head}>
        <span className={styles.label}>Advertisement</span>
        <span className={styles.note}>Paid placement — not an endorsement</span>
      </div>

      <div className={styles.body}>
        {sponsors.map((sponsor) => (
          <SponsorUnit key={sponsor.id} sponsor={sponsor} />
        ))}
      </div>
    </aside>
  );
}

function SponsorUnit({ sponsor }: { sponsor: Sponsor }) {
  const href = sponsorHref(sponsor);

  const inner = (
    <>
      <span className={styles.mark} aria-hidden>
        {sponsorInitials(sponsor)}
      </span>
      <span className={styles.text}>
        <span className={styles.role}>
          {sponsorRole(sponsor)}
          <span className={styles.tag}>Sponsored</span>
        </span>
        <span className={styles.name}>{sponsor.name}</span>
        {sponsor.tagline && (
          <span className={styles.tagline}>{sponsor.tagline}</span>
        )}
        {sponsor.credential_line && (
          <span className={`${styles.credential} mono`}>
            {sponsor.credential_line}
          </span>
        )}
      </span>
    </>
  );

  // rel="sponsored nofollow" is the correct signal for a paid link, and
  // noopener closes the tab-nabbing hole on any external destination.
  return href ? (
    <a
      className={`${styles.unit} ${styles.linked}`}
      href={href}
      rel="sponsored nofollow noopener"
      target="_blank"
    >
      {inner}
    </a>
  ) : (
    <div className={styles.unit}>{inner}</div>
  );
}
