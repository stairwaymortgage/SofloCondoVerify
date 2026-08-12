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

const PATH = "/sellers";
const TITLE = "Selling a condo buyers can't finance? There's still a way.";

export const metadata: Metadata = {
  title: "For condo sellers: selling in a flagged building · SoFloCondoVerify",
  description:
    "When a building's FHA approval has lapsed, the VA has turned it down or no reserve study is on file, financed offers fall through late. The fix is finding the buyers who can still close — and pricing and positioning for them.",
  alternates: { canonical: PATH },
};

export default async function Sellers() {
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
            "Why financed offers collapse in buildings with lapsed approvals or missing filings, and how owners sell into that market instead of around it.",
            PATH,
            "2026-08-12"
          ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Sellers", path: PATH },
          ]),
        ]}
      />
      <Masthead />

      <section className={styles.page}>
        <div className="wrap">
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "Sellers" }]} />

          <header className={styles.hero}>
            <div className={`${styles.kicker} mono`}>For owners and sellers</div>
            <h1>Selling a condo buyers can&rsquo;t finance? There&rsquo;s still a way.</h1>
            <p className={styles.lede}>
              If your building&rsquo;s FHA approval has lapsed, the VA has turned
              it down, or no reserve study has been filed, you have probably
              already felt it: offers arrive, then die at underwriting, six weeks
              in. The unit isn&rsquo;t the problem and neither are you. The
              answer is not to hope the next buyer&rsquo;s lender misses it — it
              is to know exactly what the record says and market to the buyers
              who can still close.
            </p>
            <Link className={styles.heroBtn} href="/connect?intent=sell">
              Talk to someone about selling
            </Link>
            <div className={styles.heroFine}>
              Free · no account required · no obligation
            </div>
          </header>

          <div className={styles.stats}>
            <Stat n={num(counts.flagged)} l="Buildings with 2+ signals" />
            <Stat n={num(counts.fhaExpired)} l="FHA approval lapsed" />
            <Stat n={num(counts.vaRejected)} l="Turned down by the VA" />
            <Stat n={num(counts.sirsUnconfirmed)} l="No reserve study found" />
          </div>
          <p className={styles.statsNote}>
            Read live from our buildings file, across{" "}
            {num(counts.triCounty)} tri-county buildings. If you are selling in
            one of these, you are not an unlucky exception — this is a large,
            well-understood segment of the South Florida market, and it
            transacts every week.
          </p>

          <div className={styles.grid}>
            <main className={styles.main}>
              <section className={styles.block}>
                <h2 className={styles.blockHead}>Why the offers keep collapsing</h2>
                <p className={styles.blockLede}>
                  Nothing here is about your unit. A condo loan is underwritten
                  against the building as well as the borrower, and the building
                  fails the test before your buyer ever does.
                </p>
                <ul className={styles.points}>
                  <li>
                    <b>It surfaces late.</b> Project review happens well into
                    underwriting — after inspection, after appraisal, after
                    you&rsquo;ve turned other offers away. Then the file dies and
                    the listing clock resets.
                  </li>
                  <li>
                    <b>It repeats.</b> The next financed buyer meets the same
                    wall, because the constraint belongs to the building. Two or
                    three cycles of this is what puts &ldquo;price reduced&rdquo;
                    on a listing that was never overpriced.
                  </li>
                  <li>
                    <b>Buyers rarely learn why.</b> They are told the loan
                    didn&rsquo;t work and they move on. The seller is left
                    reading it as a market signal, which it isn&rsquo;t.
                  </li>
                </ul>
              </section>

              <section className={styles.block}>
                <h2 className={styles.blockHead}>Sell into it, not around it</h2>
                <p className={styles.blockLede}>
                  Concealing a building&rsquo;s standing doesn&rsquo;t work —
                  it&rsquo;s public record, the buyer&rsquo;s lender will find
                  it, and all the delay costs you is another six weeks. Every
                  approach below starts from the record being known.
                </p>
                <ul className={styles.steps}>
                  <li>
                    <span className={styles.stepN}>1</span>
                    <span>
                      <b>Find out exactly where the building stands.</b> FHA and
                      VA positions with dates, reserve and recertification
                      filings. Free here, and it takes seconds. Conventional
                      standing isn&rsquo;t publishable, so a licensed loan
                      officer checks that separately.
                    </span>
                  </li>
                  <li>
                    <span className={styles.stepN}>2</span>
                    <span>
                      <b>Qualify the buyer pool honestly.</b> Cash buyers and
                      portfolio or non-QM lenders don&rsquo;t rely on the agency
                      lists, and foreign-national programs generally
                      don&rsquo;t either. That pool is smaller than the open
                      market and it prices accordingly — but it closes.
                    </span>
                  </li>
                  <li>
                    <span className={styles.stepN}>3</span>
                    <span>
                      <b>Put the standing in front of buyers early.</b> Disclosed
                      up front it is a known condition that shapes the price.
                      Discovered at week six it reads as something you hid, and
                      it kills the deal outright.
                    </span>
                  </li>
                  <li>
                    <span className={styles.stepN}>4</span>
                    <span>
                      <b>Ask whether the building can be fixed.</b> A lapsed FHA
                      approval is renewable, and re-approval is a documentation
                      exercise rather than a structural one. If your board is
                      willing, that changes the buyer pool for every owner —
                      including you.
                    </span>
                  </li>
                </ul>
                <p className={styles.blockNote}>
                  We are not a brokerage and we don&rsquo;t list or sell
                  property. We connect owners with licensed professionals, and
                  nothing here is a promise about a price or an outcome.
                </p>
              </section>

              {examples.length > 0 && (
                <section className={styles.block}>
                  <h2 className={styles.blockHead}>
                    What the record looks like for a flagged building
                  </h2>
                  <p className={styles.blockLede}>
                    Where several signals stack up, we publish a due-diligence
                    read — the same one a buyer&rsquo;s agent will find. Worth
                    knowing what it says about your building before a buyer
                    quotes it back at you.
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
                    <Link href="/">Look up your building →</Link>
                  </div>
                </section>
              )}

              <section className={styles.block}>
                <h2 className={styles.blockHead}>Browse by city</h2>
                <p className={styles.blockLede}>
                  How many buildings in your city carry flagged signals, and how
                  many hold current approvals.
                </p>
                <div className={styles.linkRow}>
                  {COUNTIES.map((county) => (
                    <Link key={county.slug} href={countyHref(county)}>
                      {county.name} County →
                    </Link>
                  ))}
                </div>
              </section>

              <footer className={styles.disclaimer}>
                <p>
                  Nothing on this page is legal or financial advice, and none of
                  it is a statement about any particular building or association.
                  A signal means a filing is absent, lapsed or unconfirmed in the
                  public record — never that a building is unsafe or
                  non-compliant.
                </p>
                <p className="mono">
                  Not affiliated with HUD, the VA, Fannie Mae, Freddie Mac or any
                  government agency
                </p>
              </footer>
            </main>

            <aside className={styles.side}>
              <ConnectCta
                lede="Tell us the building and what you're trying to do. We'll pass it to licensed professionals who work this kind of sale — agents who know the cash and portfolio buyer pool, and lenders who can tell you what's financeable. Free to you, no obligation."
                actions={[
                  { intent: "sell", label: "Sell my unit" },
                  { intent: "check-building", label: "Check my building" },
                  { intent: "board", label: "I'm on the board" },
                ]}
              />

              <SponsorSlot page="city" variant="card" />

              <nav className={styles.nearby} aria-label="Elsewhere">
                <div className={styles.nearbyHead}>Elsewhere</div>
                <ul>
                  <li>
                    <Link href="/for-boards">Getting the building re-approved</Link>
                  </li>
                  <li>
                    <Link href="/rules/sirs-reserve-studies">Reserve studies</Link>
                  </li>
                  <li>
                    <Link href="/forms">Forms &amp; templates</Link>
                  </li>
                  <li>
                    <Link href="/buyers">Buying a condo</Link>
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
