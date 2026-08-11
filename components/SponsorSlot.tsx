import {
  getSponsors,
  sponsorHref,
  sponsorInitials,
  sponsorRole,
  type SponsorPage,
  type SponsorVariant,
} from "@/lib/sponsors";
import type { Sponsor } from "@/lib/database.types";
import SponsorLink from "./SponsorLink";
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
          <SponsorUnit key={sponsor.id} sponsor={sponsor} page={page} />
        ))}
      </div>
    </aside>
  );
}

function SponsorUnit({
  sponsor,
  page,
}: {
  sponsor: Sponsor;
  page: SponsorPage;
}) {
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

  // SponsorLink owns rel="sponsored nofollow noopener" and the click event.
  // A sponsor with no destination still renders — as a plain div, never as an
  // unlinked stand-in for a link.
  return href ? (
    <SponsorLink
      className={`${styles.unit} ${styles.linked}`}
      href={href}
      sponsorName={sponsor.name}
      sponsorType={sponsor.type}
      page={page}
    >
      {inner}
    </SponsorLink>
  ) : (
    <div className={styles.unit}>{inner}</div>
  );
}
