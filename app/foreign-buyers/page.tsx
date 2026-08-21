import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import ConnectCtaModal from "@/components/ConnectCtaModal";
import HeroCta from "@/components/HeroCta";
import JsonLd from "@/components/JsonLd";
import SponsorSlot from "@/components/SponsorSlot";
import SiteFooter from "@/components/SiteFooter";
import { getPreconCount, getStandingCounts } from "@/lib/audiences";
import { getPreconProjects, preconHref, statusLabel } from "@/lib/precon";
import { INTERIM_DISCLOSURE } from "@/lib/disclosures";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import { FOREIGN_NATIONAL_DOWN } from "@/lib/precon";
import { num } from "@/lib/format";
import styles from "../audience.module.css";
import own from "./page.module.css";

export const revalidate = 3600;

const PATH = "/foreign-buyers";
const TITLE = "Buying from overseas? You may not need to pay all cash.";

const DOWN_PCT = Math.round(FOREIGN_NATIONAL_DOWN * 100);
const FINANCED_PCT = 100 - DOWN_PCT;

export const metadata: Metadata = {
  // Owns "South Florida condo financing" — the loan, not the building's
  // standing (/buyers has that). The non-resident qualifier rides in the
  // description: there is no room for it inside 60 characters, and the
  // phrase is worth more intact than shortened to fit a modifier.
  title: "South Florida Condo Financing",
  description:
    "Non-resident buyers don’t always need all cash. How foreign-national condo financing works in South Florida without US credit history.",
  alternates: { canonical: PATH },
};

/**
 * What a foreign-national programme underwrites instead of a US credit file.
 * Given facts about the shape of the programme, not claims about an outcome —
 * whether any of it is available to a given buyer is Jim's to say, and the
 * body slot beside these is where he says it.
 */
const LEVERAGE_BASIS = [
  "Foreign income",
  "Foreign credit",
  "No US residency",
];

/**
 * The two classes of building, as categories.
 *
 * The hard rule for this block: it describes classes of building and nothing
 * else. No building may be named in it, no category may be linked to a
 * building, and nothing in it may suggest this page will tell a buyer which
 * category a specific project falls into.
 */
const CATEGORIES = [
  { key: "financeable", label: "Financeable" },
  { key: "cash", label: "100% cash required" },
];

/**
 * Remote-preview services, for the buyer who cannot get on a plane.
 *
 * Olga's slots, not Jim's: showing property remotely is the agent's side of
 * the work, and the equivalent slot on /preconstruction is hers too.
 */
const REMOTE = [
  { key: "video-presentation", label: "Video presentations" },
  { key: "packages", label: "Photo and video packages per building" },
  { key: "walkthrough", label: "Remote walkthroughs" },
];

/**
 * Same two people, same data, same shape as /sellers, /buyers and
 * /preconstruction. Credentials are the sponsors-table values verbatim — the
 * four team blocks and the sponsor card must not drift from each other.
 */
const TEAM = [
  {
    key: "jim",
    name: "Jim Blackburn",
    photo: "/jim-blackburn.jpeg",
    focus: "50% 18%",
    role: "South Florida lending specialist",
    credential: "NMLS #1072866 · Equal Housing Lender · Stairway Mortgage",
    phone: { label: "(954) 993-1625", href: "tel:+19549931625" },
    website: "https://jamesjblackburn.com/",
  },
  {
    key: "olga",
    name: "Olga Blackburn",
    photo: "/olga-blackburn.jpeg",
    focus: "56% 22%",
    role: "South Florida real estate specialist",
    credential: "FL Lic. SL3569153 · The Keyes Company",
    // The vanity spelling is given alongside the digits; it stays visible as
    // written, but the tappable target is the dialable number.
    phone: {
      label: "786-225-5654",
      href: "tel:+17862255654",
      alt: "(786-CALL-OLG)",
    },
    website: "https://www.olgablackburn.com/",
  },
];

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

      <section className={`${styles.page} ${own.pageTight}`}>
        <div className="wrap">
          <Breadcrumbs
            trail={[{ name: "Home", href: "/" }, { name: "Foreign buyers" }]}
          />

          {/* ---- hero + leverage + CTA --------------------------------
              One grid so the language promise, the thing most non-resident
              buyers do not know, and the way to ask about it share a
              viewport on a desktop screen. */}
          <div className={own.intro}>
            <div className={own.introMain}>
              <header className={`${styles.hero} ${own.heroTight}`}>
                <div className={`${styles.kicker} mono`}>
                  For international &amp; non-resident buyers
                </div>
                {/* The page's one h1, unchanged: it carries the ranking
                    phrase and is not Jim's to rewrite. The two slots under
                    it are. */}
                <h1>
                  Buying a South Florida condo from overseas? You may be able to
                  finance it, not pay all cash.
                </h1>
                <div className={own.heroSlot}>
                  Buying from overseas? You may be able to finance it — not pay
                  all cash.
                </div>
                <div className={own.heroSlotSub}>
                  Whatever language you&rsquo;re most comfortable in, we have
                  someone on the team who speaks it — start to finish.
                </div>
                <HeroCta
                  intent="foreign-national"
                  sourcePage="/foreign-buyers"
                  label="See if I qualify to finance from abroad"
                  fine="Not a loan offer, a quote, or a commitment to lend"
                />
              </header>

              {/* ---- leverage ----
                  General programme education. No lender named, no building
                  named, and nothing here states an approval — the range is
                  the shape of a programme, and what any individual buyer
                  qualifies for is a conversation, not a page. */}
              <section className={own.panel} aria-labelledby="lev-head">
                <div className={own.panelHead}>
                  <div className={`${own.panelKicker} mono`}>
                    Financing from overseas
                  </div>
                  <h2 className={own.panelH} id="lev-head">
                    Financing from overseas
                  </h2>
                </div>

                <div className={own.levBody}>
                  {/* The figure is a slot, not a number. Any leverage
                      percentage stated here has to agree with
                      FOREIGN_NATIONAL_DOWN in lib/precon.ts, which already
                      drives the stat strip and the compare block further
                      down this page and the financing illustration on every
                      preconstruction project page. One number, one place. */}
                  <div className={own.levFigure}>
                    <div className={own.levSlot}>
                      ~{DOWN_PCT}%
                    </div>
                    <div className={own.levCap}>Leverage from a US bank</div>
                  </div>
                  <div className={own.levSide}>
                    <div className={own.chips}>
                      {LEVERAGE_BASIS.map((basis) => (
                        <span key={basis} className={`${own.chip} mono`}>
                          {basis}
                        </span>
                      ))}
                    </div>
                    <div className={own.levText}>
                      Many buyers are surprised to learn a US bank may lend to
                      them even without US residency, using foreign income and
                      foreign credit.
                    </div>
                  </div>
                </div>

                <div className={own.panelFoot}>
                  {/* INTERIM disclosure — pending Jim's final regulatory
                      wording. Shared constant so all four audience pages say
                      exactly the same thing: see lib/disclosures.ts. */}
                  <div className={own.panelNote}>{INTERIM_DISCLOSURE}</div>
                </div>
              </section>
            </div>

          </div>

          {/* ---- financeable vs cash, and remote preview ---------------- */}
          <div className={own.duo}>
            <section className={own.panel} aria-labelledby="cat-head">
              <div className={own.panelHead}>
                <div className={`${own.panelKicker} mono`}>
                  Which buildings can be financed
                </div>
                <h2 className={own.panelH} id="cat-head">
                  Which buildings can be financed
                </h2>
                <div className={own.panelLede}>
                  Some buildings can be financed. Others are cash-only.
                  We&rsquo;ll tell you which before you commit to one.
                </div>
              </div>
              <ul className={own.catList}>
                {CATEGORIES.map((category) => (
                  <li key={category.key} className={own.cat}>
                    <span className={own.catLabel}>{category.label}</span>
                  </li>
                ))}
              </ul>
              <div className={own.panelFoot}>
                {/* INTERIM disclosure — pending Jim's final regulatory
                    wording. Shared constant so all four audience pages say
                    exactly the same thing: see lib/disclosures.ts. */}
                <div className={own.panelNote}>{INTERIM_DISCLOSURE}</div>
              </div>
            </section>

            <section className={own.panel} aria-labelledby="remote-head">
              <div className={own.panelHead}>
                <div className={`${own.panelKicker} mono`}>
                  If you cannot travel
                </div>
                <h2 className={own.panelH} id="remote-head">
                  If you cannot travel
                </h2>
                <div className={own.panelLede}>
                  Can&rsquo;t fly in? We put together video presentations and
                  send all the photos and images you need to evaluate a building
                  from abroad.
                </div>
              </div>
              {/* What that covers, as a list. Olga's line above is the copy;
                  these are the named services it refers to. */}
              <ul className={own.remoteList}>
                {REMOTE.map((item) => (
                  <li key={item.key} className={own.remoteItem}>
                    <span className={own.remoteLabel}>{item.label}</span>
                  </li>
                ))}
              </ul>
              <div className={own.panelFoot} />
            </section>
          </div>

          <div className={`${styles.stats} ${own.statsDetached}`}>
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

          {/* ---- team ---- */}
          <section className={own.team} aria-label="Who you will be working with">
            {TEAM.map((person) => (
              <div key={person.key} className={own.member}>
                {/* Served at 192px for a 96px square so it stays sharp on a
                    2x screen; the square crop is done in CSS, not in the
                    file, so the originals stay untouched. */}
                <Image
                  className={own.photo}
                  src={person.photo}
                  alt={person.name}
                  width={192}
                  height={192}
                  style={{ objectPosition: person.focus }}
                />
                <div className={own.memberBody}>
                  <div className={own.memberName}>{person.name}</div>
                  <div className={own.memberRole}>{person.role}</div>
                  <div className={own.memberCred}>{person.credential}</div>
                  <div className={own.memberContact}>
                    <a className={own.memberLink} href={person.phone.href}>
                      {person.phone.label}
                    </a>
                    {person.phone.alt && (
                      <span className={`${own.memberAlt} mono`}>
                        {person.phone.alt}
                      </span>
                    )}
                  </div>
                  <a
                    className={own.memberLink}
                    href={person.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {person.website}
                  </a>
                </div>
              </div>
            ))}
          </section>

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
              <ConnectCtaModal
                lede="Tell us where you're buying from and what you're looking at. We'll pass it to a licensed loan officer who writes foreign-national loans and can give you real terms for your situation. Free to you, no obligation."
                actions={[
                  { intent: "foreign-national", label: "Foreign-national loan" },
                  { intent: "check-building", label: "Check a building" },
                  { intent: "finance", label: "Finance a purchase" },
                ]}
                sourcePage="/foreign-buyers"
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
