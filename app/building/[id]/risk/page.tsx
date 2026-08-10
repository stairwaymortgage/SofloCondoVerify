import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import SignalTable, { SignalLegend } from "@/components/SignalTable";
import SponsorSlot from "@/components/SponsorSlot";
import JsonLd from "@/components/JsonLd";
import SiteFooter from "@/components/SiteFooter";
import { getBuilding, getPriorityBuildingIds } from "@/lib/buildings";
import {
  buildSignals,
  flaggedFirst,
  hasStackedFlags,
  recordId,
} from "@/lib/signals";
import { cityHubHref, countyByDb, getCityHubForBuilding } from "@/lib/cities";
import { breadcrumbSchema, buildingSchema } from "@/lib/schema";
import type { Building } from "@/lib/database.types";
import styles from "./page.module.css";

export const revalidate = 3600;

/** Prebuild the priority set; anything else 404s, so there is nothing else. */
export async function generateStaticParams() {
  const ids = await getPriorityBuildingIds();
  return ids.map((id) => ({ id: String(id) }));
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const building = await getBuilding(params.id);
  if (!building || !hasStackedFlags(building)) {
    return { title: "Record not found · SoFloCondoVerify" };
  }

  const name = building.building_name ?? "This building";
  const where = [building.city, "FL"].filter(Boolean).join(", ");

  return {
    title: `${name} — risk & due-diligence read · SoFloCondoVerify`,
    description: `What the public record shows for ${name} in ${where}, read for buyers, sellers and cash purchasers: FHA and VA standing, reserve and recertification filings, and the questions worth asking before you go further.`,
  };
}

export default async function RiskPage({ params }: { params: { id: string } }) {
  const building = await getBuilding(params.id);

  // The read only exists for the priority set — a single unconfirmed filing
  // doesn't warrant a page telling people what to look into.
  if (!building || !hasStackedFlags(building)) notFound();

  const ordered = flaggedFirst(buildSignals(building));
  // The badge quotes the source file's flag count, not a tally of amber rows:
  // conventional standing is amber on every building and is not a finding.
  const flagged = building.signal_count ?? 0;
  const pulled = new Date(building.created_at).toISOString().slice(0, 10);
  const name = building.building_name ?? "Unnamed building";
  const location = [
    building.city,
    building.county ? `${building.county} COUNTY` : null,
    building.zip,
  ]
    .filter(Boolean)
    .join(" · ");

  const loans = loanPaths(building);

  // Home > County > City > Building > this read.
  const hub = await getCityHubForBuilding(building);
  const county = countyByDb(building.county);
  const hubHref = hub ? cityHubHref(hub) : null;

  const trail = [
    { name: "Home", path: "/" },
    ...(county ? [{ name: `${county.name} County`, path: `/condos/${county.slug}` }] : []),
    ...(hub?.city && hubHref ? [{ name: hub.city, path: hubHref }] : []),
    { name, path: `/building/${building.id}` },
    { name: "Risk & due-diligence read", path: `/building/${building.id}/risk` },
  ];

  return (
    <>
      <JsonLd schemas={[buildingSchema(building), breadcrumbSchema(trail)]} />
      <Masthead />

      <section className={styles.page}>
        <div className="wrap">
          <Breadcrumbs
            trail={trail.map((crumb, index) => ({
              name: crumb.name,
              href: index < trail.length - 1 ? crumb.path : undefined,
            }))}
          />

          <div className={styles.grid}>
            <main className={styles.main}>
              <article className={styles.record}>
                <header className={styles.recHead}>
                  <div className={`${styles.doc} mono`}>
                    Risk &amp; Due-Diligence Read
                  </div>
                  <h1>{name}</h1>
                  <div className={`${styles.addr} mono`}>
                    {building.address ?? "Address not on file"}
                    {location ? ` · ${location}` : ""}
                  </div>
                  <div className={styles.badges}>
                    <span className={styles.countBadge}>
                      {flagged} signal{flagged === 1 ? "" : "s"} flagged for review
                    </span>
                  </div>
                  <div className={`${styles.rid} mono`}>
                    RECORD <b>#{recordId(building)}</b> · Pulled {pulled}
                  </div>
                </header>

                <div className={styles.intro}>
                  <p>
                    This page is the same record as{" "}
                    <Link href={`/building/${building.id}`}>
                      the verification record
                    </Link>
                    , re-ordered so the items worth following up on come first.
                    Everything below is a fact drawn from a public filing on the
                    date it was pulled, together with the question a buyer, seller
                    or lender would normally ask next. None of it is a
                    determination about the building, its structure, or its
                    association.
                  </p>
                </div>

                <SignalTable
                  signals={ordered}
                  caption="Ordered by what to look into first. Seven independent public sources, read for this building."
                  markAttention
                />

                {building.signals && (
                  <div className={styles.rollup}>
                    <span className={styles.rollupLabel}>
                      Flagged in the source file
                    </span>
                    <span className={`${styles.rollupVal} mono`}>
                      {building.signals}
                    </span>
                  </div>
                )}
              </article>

              {/* ---- audience readings ---- */}
              <section className={styles.means}>
                <h2 className={styles.meansHead}>
                  What these flags mean for you
                </h2>

                <article className={styles.aud}>
                  <div className={styles.audHead}>If you&rsquo;re buying with a loan</div>
                  <ul className={styles.audList}>
                    <li>
                      <b>FHA.</b> {loans.fha}
                    </li>
                    <li>
                      <b>VA.</b> {loans.va}
                    </li>
                    <li>
                      <b>Conventional (Fannie/Freddie).</b> Not publishable — the
                      underlying lists aren&rsquo;t public record, so we don&rsquo;t
                      show a status either way. A licensed loan officer can check
                      it for you in minutes.
                    </li>
                    <li>
                      <b>What isn&rsquo;t affected.</b> Portfolio and non-agency
                      lenders set their own condo rules and don&rsquo;t depend on
                      FHA or VA approval, and neither do cash purchases. Ask a
                      lender to price both routes before you assume a building is
                      off the table.
                    </li>
                  </ul>
                  <p className={styles.audNote}>
                    Approval status changes when an association or a lender files
                    for it. A status here is what the record showed on{" "}
                    {pulled} — confirm it before you write an offer.
                  </p>
                </article>

                <article className={styles.aud}>
                  <div className={styles.audHead}>If you&rsquo;re selling here</div>
                  <ul className={styles.audList}>
                    <li>
                      <b>Know why offers fall through.</b> When agency approval
                      isn&rsquo;t on file, buyers using FHA or VA financing
                      can&rsquo;t close here — often without either side being told
                      why until late in the deal. That is a financing question, not
                      a statement about your unit or your building.
                    </li>
                    <li>
                      <b>Market to the buyers who can close.</b> Cash, portfolio and
                      non-resident foreign-national buyers don&rsquo;t need agency
                      approval. Pricing and marketing to that pool from day one
                      beats discovering the constraint three weeks into escrow.
                    </li>
                    <li>
                      <b>Some of this is fixable.</b> An association can apply for
                      or renew FHA approval, and filings such as a reserve study or
                      milestone report can be completed and recorded. Each one that
                      lands widens the buyer pool for every owner in the building.
                    </li>
                    <li>
                      <b>Have the paperwork ready.</b> Budget, reserve schedule,
                      recent minutes, assessment history and any inspection reports
                      answer most buyer questions before they become objections.
                    </li>
                  </ul>
                </article>

                <article className={styles.aud}>
                  <div className={styles.audHead}>If you&rsquo;re paying cash</div>
                  <p className={styles.audLede}>
                    No lender means no third party checking the building for you.
                    These are the documents that answer the questions the record
                    above raises — most are available to a buyer under contract, and
                    some to any owner on request.
                  </p>
                  <ul className={styles.checks}>
                    <Check>
                      Structural integrity reserve study (SIRS) and the milestone
                      inspection report, including any phase-two findings
                    </Check>
                    <Check>
                      Recertification file for the building — status, open permits,
                      and what the county is still waiting on
                    </Check>
                    <Check>
                      Reserve balances against the funding plan, and whether
                      reserves are fully funded or waived
                    </Check>
                    <Check>
                      Special assessment history, plus anything voted on, pending,
                      or under discussion by the board
                    </Check>
                    <Check>
                      Board minutes for the last 12–24 months — assessments and
                      repairs are usually visible there first
                    </Check>
                    <Check>
                      Current insurance placement and claims history for the
                      association
                    </Check>
                    <Check>
                      Any registry or enforcement item shown above, read in full
                      rather than summarized — these are ordinance registration
                      matters and say nothing about the structure
                    </Check>
                    <Check>
                      A Florida real-estate attorney&rsquo;s review of the
                      association documents before funds move
                    </Check>
                  </ul>
                </article>
              </section>

              {/* Paid placement, clearly labeled — the neutral matching card
                  in the sidebar is unaffected by it. */}
              <SponsorSlot page="risk" variant="leaderboard" />

              <footer className={styles.disclaimer}>
                <div className={styles.disclaimerHead}>
                  How to read this page
                </div>
                <p>
                  This is a reading of public records as they stood on {pulled}. It
                  is not advice, not an inspection, and not a determination about
                  this building, its structure, its association, or its
                  insurability.
                </p>
                <p>
                  A filing we couldn&rsquo;t find is recorded as{" "}
                  <b>unconfirmed</b> — that means we did not locate it in the
                  source, not that the building failed to file it and not that it
                  is out of compliance. Association registry items are ordinance
                  registration matters only and carry no structural meaning.
                  Conventional (Fannie/Freddie) standing is not publishable, so we
                  show no status for it in either direction.
                </p>
                <p>
                  Records change. Anything here can be superseded by a filing made
                  after the pull date, and the association or a licensed
                  professional is the right source for the current position.
                </p>
                <p className="mono">
                  Not legal or financial advice · Not affiliated with any government
                  agency
                </p>
              </footer>
            </main>

            <aside className={styles.side}>
              <div className={styles.cta}>
                <div className={styles.ctaHead}>Get connected — free</div>
                <div className={styles.ctaBody}>
                  <p className={styles.ctaLede}>
                    Two questions this page can&rsquo;t answer: what a specific
                    lender will actually do here, and what your unit is worth to
                    the buyers who can close. Both take a licensed professional.
                  </p>
                  <div className={styles.ctaBtns}>
                    <Link
                      className={styles.btnPrimary}
                      href={`/connect?intent=sell&record=${building.id}`}
                    >
                      Selling — how to position
                    </Link>
                    <Link
                      className={styles.btnSecondary}
                      href={`/connect?intent=finance&record=${building.id}`}
                    >
                      Buying — check my financing
                    </Link>
                  </div>
                  <p className={styles.ctaFine}>
                    Free · no account required · no obligation
                  </p>
                </div>
              </div>

              <SignalLegend />

              <div className={styles.back}>
                <Link href={`/building/${building.id}`}>
                  ← Back to the verification record
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}

/**
 * What the record does and doesn't say about each agency loan route. Framed as
 * availability on the record — never as a judgement about the building.
 */
function loanPaths(building: Building): { fha: string; va: string } {
  const fhaStatus = building.fha_status?.trim();
  const vaStatus = building.va_status?.trim();

  let fha: string;
  if (fhaStatus === "Approved") {
    fha =
      "The building is on HUD's approved list on this record, so an FHA loan is available here — confirm the approval hasn't lapsed before you write.";
  } else if (fhaStatus === "Expired") {
    fha =
      "HUD's approval shows as expired on this record. FHA financing needs a current approval, so a buyer would be waiting on the association to renew it — a lender can tell you where that application stands.";
  } else if (fhaStatus?.startsWith("Rejected")) {
    fha =
      "The record shows an FHA approval request that wasn't granted. That closes the FHA route on today's record; it doesn't prevent a fresh application later, and a lender can tell you what a new one would turn on.";
  } else {
    fha =
      "No FHA approval appears on this record. Absence of an approval isn't a rejection — it usually means nobody has applied. An association can apply, and in some cases a lender can pursue single-unit approval where the building is eligible.";
  }

  let va: string;
  if (vaStatus?.startsWith("Accepted") || vaStatus === "HUD Accepted") {
    va =
      "The building appears as accepted on the VA condominium report, so a VA loan is available here on this record.";
  } else if (vaStatus === "Rejected") {
    va =
      "The VA condominium report shows this building as rejected. A VA buyer can't close here on today's record, and the association would need to pursue acceptance to change that.";
  } else if (vaStatus === "Deleted") {
    va =
      "The building was removed from the VA list, which leaves its current standing unconfirmed rather than rejected. A VA-approved lender can check the live list for you.";
  } else {
    va =
      "The building isn't on the VA condominium report we read. That's unconfirmed standing, not a rejection — a VA-approved lender can check the current list.";
  }

  return { fha, va };
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li>
      <span className={styles.checkBox} aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M5 12l5 5L20 6" />
        </svg>
      </span>
      <span>{children}</span>
    </li>
  );
}
