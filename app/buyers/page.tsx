import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import ConnectCta from "@/components/ConnectCta";
import InquiryForm from "@/components/InquiryForm";
import JsonLd from "@/components/JsonLd";
import SponsorSlot from "@/components/SponsorSlot";
import SiteFooter from "@/components/SiteFooter";
import { getFlaggedExamples, getStandingCounts } from "@/lib/audiences";
import { COUNTIES, countyHref } from "@/lib/cities";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import { num } from "@/lib/format";
import styles from "../audience.module.css";
import own from "./page.module.css";

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

/**
 * An unwritten slot.
 *
 * Every one of these is financing copy that has to come from Jim (NMLS
 * attributed) or from compliance, and must not be drafted here. It renders
 * loud on purpose — amber, monospace, dashed — so a page that still has one
 * in it cannot be mistaken for a finished page at a glance.
 */
function Ph({ children }: { children: React.ReactNode }) {
  return <span className={`${own.ph} mono`}>{children}</span>;
}

/**
 * The three tiers, as categories. Jim's words, transcribed.
 *
 * The hard rule for this block: it describes classes of building and nothing
 * else. No building may be named in it, no tier may be linked to a building,
 * and nothing in it may suggest this page will tell anyone where a specific
 * project sits — conventional standing is not public record and is not
 * publishable here.
 */
const TIERS = [
  {
    key: "cash",
    need: "All cash",
    when: "For buildings that can't be financed",
  },
  {
    key: "non-warrantable",
    need: "At least 40% down",
    when: "For buildings that aren't warrantable",
  },
  {
    key: "warrantable",
    need: "As little as 0% down",
    when: "For buildings that are warrantable or FHA-approved",
  },
];

/**
 * Same two people, same given data, same shape as /preconstruction.
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
    // Matches the sponsors-table credential_line verbatim. This page carries
    // both the editorial team block and the paid sponsor card, so the two
    // credentials for the same name sit on one screen — they have to agree.
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
    // Sponsors-table value, verbatim. Note the SL prefix — the licence number
    // given without it was incomplete.
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

      <section className={`${styles.page} ${own.pageTight}`}>
        <div className="wrap">
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "Buyers" }]} />

          {/* ---- hero + tiers + CTA ------------------------------------
              One grid so the pitch, the three tiers and the way to respond
              to them share a viewport on a desktop screen. */}
          <div className={own.intro}>
            <div className={own.introMain}>
              <header className={`${styles.hero} ${own.heroTight}`}>
                <div className={`${styles.kicker} mono`}>For condo buyers</div>
                {/* The page's one h1, unchanged: it carries the ranking
                    phrase and is not Jim's to rewrite. The two slots under
                    it are. */}
                <h1>
                  Buying a South Florida condo? Check the building&rsquo;s
                  approval before you fall in love.
                </h1>
                <div className={own.heroSlot}>
                  It&rsquo;s not enough to get you approved. The building has to
                  be approved too.
                </div>
                <div className={own.heroSlotSub}>
                  Getting you pre-approved on credit, income and assets is only
                  half of it. The building has to qualify for the financing you
                  want — and that&rsquo;s knowable before you tour a single unit.
                </div>
              </header>

              {/* ---- three tiers ----
                  Category education, and only that. What the buyer needs
                  depends on which class of building they are standing in
                  front of — which class a given building is in is a
                  conversation with a licensed loan officer, not something
                  this page answers. */}
              <section className={own.tiers} aria-labelledby="tiers-head">
                <div className={own.tiersHead}>
                  <div className={`${own.tiersKicker} mono`}>
                    What the building changes
                  </div>
                  <h2 className={own.tiersH} id="tiers-head">
                    <Ph>[[JIM: tier block heading]]</Ph>
                  </h2>
                  <div className={own.tiersLede}>
                    Depending on the building, you could be looking at:
                  </div>
                </div>

                <ul className={own.tierList}>
                  {TIERS.map((tier) => (
                    <li key={tier.key} className={own.tier}>
                      <span className={own.tierNeed}>{tier.need}</span>
                      <span className={`${own.tierWhen} mono`}>{tier.when}</span>
                    </li>
                  ))}
                </ul>

                <div className={own.tiersFoot}>
                  <div className={own.tiersNote}>
                    <Ph>
                      [[COMPLIANCE: general-education disclosure — these are
                      categories, not a statement about any building, and not
                      a loan offer or commitment to lend]]
                    </Ph>
                  </div>
                </div>
              </section>
            </div>

            <aside className={own.introCta} aria-label="Ask about financing">
              <InquiryForm
                source="/buyers"
                intent="finance"
                heading="Find out where you stand — and where the building stands"
                buttonLabel="Talk to a South Florida condo specialist"
                disclosure="[[COMPLIANCE: disclosure text — reviewed wording, do not draft]]"
              />
            </aside>
          </div>

          <div className={`${styles.stats} ${own.statsDetached}`}>
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
