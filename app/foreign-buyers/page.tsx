import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import ConnectCta from "@/components/ConnectCta";
import JsonLd from "@/components/JsonLd";
import SponsorSlot from "@/components/SponsorSlot";
import SiteFooter from "@/components/SiteFooter";
import { getPreconCount, getStandingCounts } from "@/lib/audiences";
import { getPreconProjects, preconHref, statusLabel } from "@/lib/precon";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import { FOREIGN_NATIONAL_DOWN } from "@/lib/precon";
import { num } from "@/lib/format";
import styles from "../audience.module.css";

export const revalidate = 3600;

const PATH = "/foreign-buyers";
const TITLE = "Buying from overseas? You may not need to pay all cash.";

const DOWN_PCT = Math.round(FOREIGN_NATIONAL_DOWN * 100);
const FINANCED_PCT = 100 - DOWN_PCT;

export const metadata: Metadata = {
  title: "Foreign-national condo buyers: financing without US credit · SoFloCondoVerify",
  description:
    "Non-resident buyers don't automatically have to pay all cash for a South Florida condo. How foreign-national programs work without US credit or income history, and what they typically ask for.",
  alternates: { canonical: PATH },
};

export default async function ForeignBuyers() {
  const [counts, preconCount, projects] = await Promise.all([
    getStandingCounts(),
    getPreconCount(),
    getPreconProjects(),
  ]);

  // Priced projects first — they are the ones where the cash-versus-financed
  // comparison means anything to someone landing here.
  const featured = projects
    .filter((project) => project.priceFrom !== null)
    .sort((a, b) => (b.priceFrom ?? 0) - (a.priceFrom ?? 0))
    .slice(0, 4);

  return (
    <>
      <JsonLd
        schemas={[
          articleSchema(
            TITLE,
            "How non-resident buyers finance a South Florida condo without US credit or income history, and what foreign-national programs typically require.",
            PATH,
            "2026-08-12"
          ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Foreign buyers", path: PATH },
          ]),
        ]}
      />
      <Masthead />

      <section className={styles.page}>
        <div className="wrap">
          <Breadcrumbs
            trail={[{ name: "Home", href: "/" }, { name: "Foreign buyers" }]}
          />

          <header className={styles.hero}>
            <div className={`${styles.kicker} mono`}>
              For international &amp; non-resident buyers
            </div>
            <h1>Buying from overseas? You may not need to pay all cash.</h1>
            <p className={styles.lede}>
              Most non-resident buyers are told the same thing: no US credit
              history, no US tax returns, no mortgage — bring the whole purchase
              price. That is often simply out of date. Foreign-national programs
              exist precisely for buyers with no US credit file, and they are
              built around documents you already have at home. Financing the bulk
              of the price keeps the rest of your capital working somewhere else.
            </p>
            <Link className={styles.heroBtn} href="/connect?intent=foreign-national">
              Ask about foreign-national financing
            </Link>
            <div className={styles.heroFine}>
              Free · no account required · no obligation
            </div>
          </header>

          <div className={styles.stats}>
            <Stat n={num(preconCount)} l="Preconstruction projects on file" />
            <Stat n={num(counts.triCounty)} l="Tri-county buildings on file" />
            <Stat n={`~${DOWN_PCT}%`} l="Typical starting down payment" />
            <Stat n={`~${FINANCED_PCT}%`} l="Commonly financed" />
          </div>
          <p className={styles.statsNote}>
            Project and building counts are read live from our file. The
            percentages are a common starting point for non-resident programs,
            not a quote — see the note at the foot of this page.
          </p>

          <div className={styles.grid}>
            <main className={styles.main}>
              <section className={styles.block}>
                <h2 className={styles.blockHead}>
                  All cash versus financed, on the same purchase
                </h2>
                <p className={styles.blockLede}>
                  The arithmetic is the whole argument. On a purchase where a
                  non-resident program starts at {DOWN_PCT}% down:
                </p>
                <div className={styles.compare}>
                  <div className={styles.compareCol}>
                    <div className={styles.compareLabel}>Paying all cash</div>
                    <div className={`${styles.compareBig} mono`}>100%</div>
                    <div className={styles.compareNote}>
                      The full purchase price leaves your hands at closing, and
                      stays in the property until you sell it.
                    </div>
                  </div>
                  <div className={`${styles.compareCol} ${styles.compareOn}`}>
                    <div className={styles.compareLabel}>
                      Financed · {DOWN_PCT}% down
                    </div>
                    <div className={`${styles.compareBig} mono`}>{DOWN_PCT}%</div>
                    <div className={styles.compareNote}>
                      Your cash at closing. The remaining{" "}
                      <b>{FINANCED_PCT}%</b> is what a US lender would be asked
                      to finance, and it stays invested elsewhere.
                    </div>
                  </div>
                </div>
                <p className={styles.blockNote}>
                  <b>Illustrative only.</b> These are round numbers to show the
                  shape of the choice — not a quote, a rate, an approval, or a
                  commitment to lend.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.blockHead}>
                  How a foreign-national loan works
                </h2>
                <p className={styles.blockLede}>
                  These programs assume you have no US credit file. That is the
                  starting condition, not a problem to be argued around.
                </p>
                <ul className={styles.steps}>
                  <li>
                    <span className={styles.stepN}>1</span>
                    <span>
                      <b>No US credit score required.</b> Lenders generally
                      substitute an international credit reference, or letters
                      from banks you already hold accounts with.
                    </span>
                  </li>
                  <li>
                    <span className={styles.stepN}>2</span>
                    <span>
                      <b>Income documented from home.</b> Typically a letter from
                      your accountant or employer, plus bank statements —
                      commonly translated into English, with amounts converted to
                      US dollars.
                    </span>
                  </li>
                  <li>
                    <span className={styles.stepN}>3</span>
                    <span>
                      <b>A larger deposit, and reserves.</b> The higher down
                      payment is how the lender prices the absence of a US credit
                      history. Expect to show several months of payments held in
                      reserve on top of the deposit.
                    </span>
                  </li>
                  <li>
                    <span className={styles.stepN}>4</span>
                    <span>
                      <b>The building still gets reviewed.</b> A foreign-national
                      loan is still a condo loan, so the project matters. These
                      programs are usually portfolio products, which means they
                      don&rsquo;t depend on the FHA or VA lists — often an
                      advantage in buildings where those have lapsed.
                    </span>
                  </li>
                </ul>
                <p className={styles.blockNote}>
                  Terms vary widely between lenders and depend on your situation,
                  the country your income comes from, and the specific project.
                  Nothing here is an offer of credit.
                </p>
              </section>

              {featured.length > 0 && (
                <section className={styles.block}>
                  <h2 className={styles.blockHead}>
                    Preconstruction, where most overseas buyers start
                  </h2>
                  <p className={styles.blockLede}>
                    New-construction projects take deposits in stages and are the
                    most common entry point for international buyers. Each
                    project page carries its status, delivery, published starting
                    price and short-term-rental position.
                  </p>
                  <ul className={styles.records}>
                    {featured.map((project) => (
                      <li key={project.slug}>
                        <Link href={preconHref(project)}>
                          <span>
                            <span className={styles.recName}>
                              {project.project}
                            </span>
                            {project.area && (
                              <span className={`${styles.recWhere} mono`}>
                                {" "}
                                · {project.area}
                              </span>
                            )}
                          </span>
                          <span className={`${styles.recWhere} mono`}>
                            {statusLabel(project.status)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className={styles.linkRow}>
                    <Link href="/preconstruction">
                      All {num(preconCount)} preconstruction projects →
                    </Link>
                    <Link href="/developers">Developers &amp; architects →</Link>
                  </div>
                </section>
              )}

              <section className={styles.block}>
                <h2 className={styles.blockHead}>
                  Check the building before you commit
                </h2>
                <p className={styles.blockLede}>
                  Whether you finance or pay cash, the building&rsquo;s standing
                  affects what you can do later — refinancing it, and who can buy
                  it from you when you sell.
                </p>
                <ul className={styles.points}>
                  <li>
                    <b>Resale matters even to a cash buyer.</b> If the building
                    has no FHA or VA standing, your future buyer faces the same
                    financing constraint you avoided. That shapes the price you
                    will get.
                  </li>
                  <li>
                    <b>Short-term rental rules vary by project</b> and change what
                    an investment purchase is worth. We record the position where
                    the project publishes one.
                  </li>
                  <li>
                    <b>Reserve and structural filings are public.</b> Look them up
                    free, with the date each was read and a link to the source.
                  </li>
                </ul>
                <div className={styles.linkRow}>
                  <Link href="/">Look up a building →</Link>
                  <Link href="/buyers">Buying with US financing →</Link>
                </div>
              </section>

              <footer className={styles.disclaimer}>
                <p>
                  <b>Nothing on this page is an offer of credit, a quote, a rate,
                  or a commitment to lend.</b> Down payment, rate, reserve and
                  documentation requirements depend entirely on the lender, the
                  program, the project and your circumstances, and they change.
                  SoFloCondoVerify is not a lender or a brokerage — we pass your
                  request to licensed professionals who can give you real terms.
                </p>
                <p>
                  Nothing here is legal, tax or financial advice. Buying US
                  property as a non-resident carries tax and reporting
                  consequences in both countries; take advice from a qualified
                  professional in each.
                </p>
                <p className="mono">
                  Not affiliated with HUD, the VA, Fannie Mae, Freddie Mac or any
                  government agency · Equal Housing Opportunity
                </p>
              </footer>
            </main>

            <aside className={styles.side}>
              <ConnectCta
                lede="Tell us where you're buying from and what you're looking at. We'll pass it to a licensed loan officer who writes foreign-national loans and can give you real terms for your situation. Free to you, no obligation."
                actions={[
                  { intent: "foreign-national", label: "Foreign-national loan" },
                  { intent: "check-building", label: "Check a building" },
                  { intent: "finance", label: "Finance a purchase" },
                ]}
              />

              <SponsorSlot page="precon" variant="card" />

              <nav className={styles.nearby} aria-label="Elsewhere">
                <div className={styles.nearbyHead}>Elsewhere</div>
                <ul>
                  <li>
                    <Link href="/preconstruction">Preconstruction projects</Link>
                  </li>
                  <li>
                    <Link href="/developers">Developers &amp; architects</Link>
                  </li>
                  <li>
                    <Link href="/rules">Florida condo rules</Link>
                  </li>
                  <li>
                    <Link href="/buyers">Buying with US financing</Link>
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
