import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import ConnectCtaModal from "@/components/ConnectCtaModal";
import HeroCta from "@/components/HeroCta";
import InquiryForm from "@/components/InquiryForm";
import JsonLd from "@/components/JsonLd";
import SponsorSlot from "@/components/SponsorSlot";
import SiteFooter from "@/components/SiteFooter";
import { getFlaggedExamples, getStandingCounts } from "@/lib/audiences";
import { COUNTIES, countyHref } from "@/lib/cities";
import { INTERIM_DISCLOSURE, consentText } from "@/lib/disclosures";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import { num } from "@/lib/format";
import styles from "../audience.module.css";
import own from "./page.module.css";

export const revalidate = 3600;

const PATH = "/sellers";
const TITLE = "Selling a condo buyers can't finance? There's still a way.";

export const metadata: Metadata = {
  // Owns "selling a South Florida condo". Sell-side verb, and deliberately
  // carries no buyer, approval or financing term.
  title: "Selling a South Florida Condo",
  description:
    "Lapsed FHA approval or a missing reserve study kills financed offers late. How to price and position a South Florida condo and still close.",
  alternates: { canonical: PATH },
};

/**
 * An unwritten slot.
 *
 * Every one of these is sell-side copy that has to come from Olga (brokerage
 * attributed) or from compliance, and must not be drafted here. It renders
 * loud on purpose — amber, monospace, dashed — so a page that still has one
 * in it cannot be mistaken for a finished page at a glance.
 */
function Ph({ children }: { children: React.ReactNode }) {
  return <span className={`${own.ph} mono`}>{children}</span>;
}

/**
 * The three buyer pools, as categories.
 *
 * `need` is what the buyer brings and is the given structure of the block.
 * `body` is Olga's: who that pool is, where they look, and why the marketing
 * for them is not the marketing for the other two.
 *
 * The hard rule for this block: it describes classes of buyer and nothing
 * else. No building may be named in it, no pool may be linked to a building,
 * and nothing in it may suggest this page will tell an owner which pool
 * their own building draws.
 */
/**
 * The three cards are the middle of one sentence that runs from the lede
 * above them ("If you don't know whether your unit needs:") to the close
 * below ("...then you don't know who you're marketing to"). That is why the
 * third reads lower-case — it continues a list, it does not head a card.
 */
const POOLS = [
  { key: "cash", need: "100% cash to buy" },
  { key: "forty", need: "40% down to buy" },
  { key: "zero", need: "as little as 0% down to buy" },
];

/**
 * Same two people, same data, same shape as /buyers and /preconstruction.
 * Credentials are the sponsors-table values verbatim — the three team blocks
 * and the sponsor card must not drift from each other.
 *
 * `focus` is the object-position for the square crop: both sources are
 * white-background headshots framed differently, so each needs its own focal
 * point rather than a shared centre crop.
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

      <section className={`${styles.page} ${own.pageTight}`}>
        <div className="wrap">
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "Sellers" }]} />

          {/* ---- hero + pools + CTA ------------------------------------
              One grid so the offer, the three buyer pools and the way to
              ask for the report share a viewport on a desktop screen. */}
          <div className={own.intro}>
            <div className={own.introMain}>
              <header className={`${styles.hero} ${own.heroTight}`}>
                <div className={`${styles.kicker} mono`}>
                  For owners and sellers
                </div>
                {/* The page's one h1, unchanged: it carries the ranking
                    phrase and is not Olga's to rewrite. The two slots under
                    it are. */}
                <h1>
                  Selling a South Florida condo buyers can&rsquo;t finance?
                  There&rsquo;s still a way.
                </h1>
                <div className={own.heroSlot}>
                  Before you list, find out who can actually buy it.
                </div>
                <div className={own.heroSlotSub}>
                  Your free value report covers more than price. It analyses the
                  building — because the building decides your buyer pool.
                </div>
                <HeroCta
                  intent="sell"
                  sourcePage="/sellers"
                  label="Get my free value & building report"
                  fine="Free to you &middot; no obligation"
                />
              </header>

              {/* ---- buyer pools ----
                  Category education, and only that. The building decides
                  which pool an owner is actually selling into — which pool a
                  given building draws is a conversation with a licensed
                  professional, not something this page answers. */}
              <section className={own.pools} aria-labelledby="pools-head">
                <div className={own.poolsHead}>
                  {/* The kicker carries the section's accessible name: the
                      heading slot above the lede was redundant and is gone,
                      so `aria-labelledby` on the section points here. This id
                      must move with it, never be dropped. */}
                  <div className={`${own.poolsKicker} mono`} id="pools-head">
                    Who can actually buy
                  </div>
                  <div className={own.poolsLede}>
                    If you don&rsquo;t know whether your unit needs:
                  </div>
                </div>

                <ul className={own.poolList}>
                  {POOLS.map((pool) => (
                    <li key={pool.key} className={own.pool}>
                      <span className={own.poolNeed}>{pool.need}</span>
                    </li>
                  ))}
                </ul>

                <div className={own.poolsFoot}>
                  {/* Closes the sentence the lede opened. */}
                  <div className={own.poolsClose}>
                    &hellip;then you don&rsquo;t know who you&rsquo;re marketing
                    to. Those are three different groups of buyers, in three
                    different places, needing three different campaigns.
                  </div>
                  {/* INTERIM disclosure — pending Jim's final regulatory
                      wording. Shared constant so all four audience pages say
                      exactly the same thing: see lib/disclosures.ts. */}
                  <div className={own.poolsNote}>{INTERIM_DISCLOSURE}</div>
                </div>
              </section>
            </div>

            <aside className={own.introCta} aria-label="Request the report">
              <InquiryForm
                source="/sellers"
                intent="sell"
                heading="Get your free value and building report"
                buttonLabel="Request my free report"
                /* INTERIM — pending Jim's final wording. lib/disclosures.ts */
                disclosure={INTERIM_DISCLOSURE}
                /* TCPA consent, verbatim and identical on all four pages. */
                consentText={consentText}
              />
            </aside>
          </div>

          <div className={`${styles.stats} ${own.statsDetached}`}>
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
              <ConnectCtaModal
                lede="Tell us the building and what you're trying to do. We'll pass it to licensed professionals who work this kind of sale — agents who know the cash and portfolio buyer pool, and lenders who can tell you what's financeable. Free to you, no obligation."
                actions={[
                  { intent: "sell", label: "Sell my unit" },
                  { intent: "check-building", label: "Check my building" },
                  { intent: "board", label: "I'm on the board" },
                ]}
                sourcePage="/sellers"
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
