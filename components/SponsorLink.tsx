"use client";

import { track } from "@/lib/analytics";

interface Props {
  className: string;
  href: string;
  sponsorName: string;
  sponsorType: string;
  /** Page type the slot was rendered on, so placements can be compared. */
  page: string;
  children: React.ReactNode;
}

/**
 * The anchor half of a sponsor unit, split out only so the click can be
 * measured — SponsorSlot itself stays a server component.
 *
 * rel and target are set here, not passed in: a paid link must carry
 * `sponsored nofollow` whatever the caller does, and `noopener` closes the
 * tab-nabbing hole that `target="_blank"` opens. Nothing about the rendered
 * markup changed when tracking was added.
 */
export default function SponsorLink({
  className,
  href,
  sponsorName,
  sponsorType,
  page,
  children,
}: Props) {
  return (
    <a
      className={className}
      href={href}
      rel="sponsored nofollow noopener"
      target="_blank"
      onClick={() =>
        track("sponsor_clicked", {
          sponsor_name: sponsorName,
          sponsor_type: sponsorType,
          page_type: page,
          destination: href,
        })
      }
    >
      {children}
    </a>
  );
}
