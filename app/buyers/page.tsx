import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import ConnectCta from "@/components/ConnectCta";
import JsonLd from "@/components/JsonLd";
import SponsorSlot from "@/components/SponsorSlot";
import SiteFooter from "@/components/SiteFooter";
import { getFlaggedExamples, getStandingCounts } from "@/lib/audiences";
import { COUNTIES, countyHref } from "@/lib/cities";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import { num } from "@/lib/format";
import styles from "../audience.module.css";

export const revalidate = 3600;

const PATH = "/buyers";
const TITLE =
  "Buying a South Florida condo? Check the building before you fall in love.";

export const metadata: Metadata = {
  // Owns "South Florida condo approval" — the building's lender standing.
  // Never "financing": that is the loan itself and belongs to /foreign-buyers.
  title: "South Florida Condo Approval Check",
  description:
    "Will a lender approve this condo building? Check FHA and VA standing free before you make an offer on a South Florida condo.",
  alternates: { canonical: PATH },
};

export default async function Buyers() {
  const [counts, examples] = await Promise.all([
    getStandingCounts(),
    getFlaggedExamples(4),
  ]);

  return (
    <>
      <JsonLd
        schemas={[
          articleSchema(
            TITLE,
            "Why a condo mortgage depends on the building as well as the borrower, and how to check the building's standing before you make an offer.",
            PATH,
            "2026-08-12"
          ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Buyers", path: PATH },
          ]),
        ]}
      />
      <Masthead />

      <section className={styles.page}>
        <div className="wrap">
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "Buyers" }]} />

          <header className={styles.hero}>
            <div className={`${styles.kicker} mono`}>For condo buyers</div>
            <h1>
              Buying a South Florida condo? Check the building&rsquo;s approval
              before you fall in love.
            </h1>
            <p className={styles.lede}>
              A condo mortgage has two borrowers: you, and the building. You can
              have perfect credit and a large deposit and still be turned down
              because of the project the unit sits in — and most buyers find that
              out weeks into a contract, after the inspection and after the
              deposit is down. The building&rsquo;s FHA and VA standing is public
              record. It takes a few seconds to look up, before you make an offer
              rather than after.
            </p>
            <Link className={styles.heroBtn} href="/">
              Look up a building — free
            </Link>
            <div className={styles.heroFine}>
              Free · no account required · no obligation
            </div>
          </header>

          <div className={styles.stats}>
            <Stat n={num(counts.triCounty)} l="Tri-county buildings on file" />
            <Stat n={num(counts.fhaApproved)} l="Hold a current FHA approval" />
            <Stat n={num(counts.vaAccepted)} l="Accepted on the VA list" />
            <Stat n={num(counts.flagged)} l="Carry two or more signals" />
          </div>
          <p className={styles.statsNote}>
            Read live from our buildings file. The approved counts are small
            because most buildings have nothing on file at all — which almost
            always means the association never applied, not that anyone was
            turned down. Nothing on file is not a mark against a building; it
            just means those two loan types aren&rsquo;t available there today.
          </p>

          <div className={styles.grid}>
            <main className={styles.main}>
              <section className={styles.block}>
                <h2 className={styles.blockHead}>
                  What a lender checks that has nothing to do with you
                </h2>
                <p className={styles.blockLede}>
                  Your file is only half of the decision. These are properties of
                  the project, and no amount of borrower strength changes them.
                </p>
                <ul className={styles.points}>
                  <li>
                    <b>Approval lists.</b> FHA and VA each publish which projects
                    they will lend in. If the building isn&rsquo;t on the list,
                    that loan type is off the table there — whatever your credit
                    looks like.
                  </li>
                  <li>
                    <b>Reserves and the budget.</b> How much the association holds
                    against future repairs, and whether a reserve study has been
                    filed.
                  </li>
                  <li>
                    <b>Structural filings.</b> Milestone inspection and 40-year
                    recertification status, which in Florida now sit close to the
                    centre of the conversation.
                  </li>
                  <li>
                    <b>The association itself.</b> Owner-occupancy share,
                    delinquency rate, insurance, litigation, and how quickly the
                    board returns a lender questionnaire.
                  </li>
                </ul>
              </section>

              <section className={styles.block}>
                <h2 className={styles.blockHead}>
                  What we can show you, and what we can&rsquo;t
                </h2>
                <ul className={styles.steps}>
                  <li>
                    <span className={styles.stepN}>1</span>
                    <span>
                      <b>FHA and VA standing — public, and here.</b> Both agencies
                      publish their project lists. We read them, date them, and
                      link every status back to its official source, so you can
                      check the building yourself in a few seconds.
                    </span>
                  </li>
                  <li>
                    <span className={styles.stepN}>2</span>
                    <span>
                      <b>Structural and reserve signals — public, and here.</b>{" "}
                      Milestone, reserve study and recertification filings, each
                      with the date it was read. Where a filing isn&rsquo;t found
                      we say <b>unconfirmed</b>, because an absent record is not
                      evidence of a violation.
                    </span>
                  </li>
                  <li>
                    <span className={styles.stepN}>3</span>
                    <span>
                      <b>Conventional — not publishable.</b> The Fannie Mae and
                      Freddie Mac project lists are not public record, so nobody
                      can honestly publish that status, and you should be
                      sceptical of any site that claims to. A licensed loan
                      officer can check it directly for a specific building.
                    </span>
                  </li>
                </ul>
                <p className={styles.blockNote}>
                  Our signals are leads for a conversation, never verdicts on a
                  building. A flag means something is worth asking about — not
                  that the building is unsound, and not that you can&rsquo;t buy
                  there.
                </p>
              </section>

              {examples.length > 0 && (
                <section className={styles.block}>
                  <h2 className={styles.blockHead}>
                    What a flagged building looks like
                  </h2>
                  <p className={styles.blockLede}>
                    Where the record shows several signals stacked together, we
                    publish a due-diligence read: what the filings say, and the
                    questions worth putting to the association before you go
                    further. A few live examples.
                  </p>
                  <ul className={styles.records}>
                    {examples.map((example) => (
                      <li key={example.id}>
                        <Link href={`/building/${example.id}/risk`}>
                          <span>
                            <span className={styles.recName}>{example.name}</span>
                            {example.city && (
                              <span className={`${styles.recWhere} mono`}>
                                {" "}
                                · {example.city}
                              </span>
                            )}
                          </span>
                          <span className={styles.recFlags}>
                            {example.signalCount} signals
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className={styles.linkRow}>
                    <Link href="/">Look up any building →</Link>
                  </div>
                </section>
              )}

              <section className={styles.block}>
                <h2 className={styles.blockHead}>Browse by city</h2>
                <p className={styles.blockLede}>
                  Each county page breaks down by city: how many buildings we
                  hold, how many are FHA-approved or VA-accepted, what&rsquo;s in
                  preconstruction, and how many carry flagged signals.
                </p>
                <div className={styles.linkRow}>
                  {COUNTIES.map((county) => (
                    <Link key={county.slug} href={countyHref(county)}>
                      {county.name} County →
                    </Link>
                  ))}
                </div>
              </section>

              <section className={styles.block}>
                <h2 className={styles.blockHead}>Before you write an offer</h2>
                <ul className={styles.points}>
                  <li>
                    <b>Look the building up here first.</b> Free, no account. If
                    FHA or VA standing matters to your loan, you will know in
                    seconds whether it exists.
                  </li>
                  <li>
                    <b>Ask a licensed loan officer about conventional standing</b>{" "}
                    for that specific building, early — before the inspection
                    period, not during it.
                  </li>
                  <li>
                    <b>Ask the association for the budget, reserve schedule and
                    any milestone report.</b> A board that answers quickly is
                    itself a good sign.
                  </li>
                </ul>
                <div className={styles.linkRow}>
                  <Link href="/rules/fha-approval-and-single-unit">
                    How FHA approval works →
                  </Link>
                  <Link href="/rules/conventional-full-review-2026">
                    The 2026 conventional change →
                  </Link>
                  <Link href="/rules/sirs-reserve-studies">
                    Reserve studies explained →
                  </Link>
                </div>
              </section>

              <footer className={styles.disclaimer}>
                <p>
                  Nothing on this page is legal or financial advice, and none of
                  it is a statement about any particular building or association.
                  Every status we publish is dated and linked to the public
                  record it came from, and an absent filing is recorded as
                  unconfirmed rather than as a failure.
                </p>
                <p className="mono">
                  Not affiliated with HUD, the VA, Fannie Mae, Freddie Mac or any
                  government agency
                </p>
              </footer>
            </main>

            <aside className={styles.side}>
              <ConnectCta
                lede="Tell us the building you're looking at. We'll pass it to a licensed loan officer who can check what the public record can't show — conventional standing included. Free to you, no obligation."
                actions={[
                  { intent: "finance", label: "Finance a purchase" },
                  { intent: "check-building", label: "Check a building" },
                  { intent: "foreign-national", label: "Foreign-national loan" },
                ]}
              />

              <SponsorSlot page="city" variant="card" />

              <nav className={styles.nearby} aria-label="Elsewhere">
                <div className={styles.nearbyHead}>Elsewhere</div>
                <ul>
                  <li>
                    <Link href="/rules">Rules &amp; requirements</Link>
                  </li>
                  <li>
                    <Link href="/preconstruction">Preconstruction</Link>
                  </li>
                  <li>
                    <Link href="/foreign-buyers">Buying from overseas</Link>
                  </li>
                  <li>
                    <Link href="/sellers">Selling in a flagged building</Link>
                  </li>
                </ul>
              </nav>
            </aside>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className={styles.stat}>
      <div className={styles.statN}>{n}</div>
      <div className={styles.statL}>{l}</div>
    </div>
  );
}
