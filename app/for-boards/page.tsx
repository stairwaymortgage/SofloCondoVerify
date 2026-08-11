import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import ConnectCta from "@/components/ConnectCta";
import JsonLd from "@/components/JsonLd";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/lib/supabase";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import { num } from "@/lib/format";
import styles from "./page.module.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "For condo boards: getting your building back on the lenders' lists · SoFloCondoVerify",
  description:
    "Lost FHA approval and sales stalled? What FHA and GSE standing does to your owners' resale values, what re-approval involves, and how to get connected with professionals who handle it.",
  alternates: { canonical: "/for-boards" },
};

/** How many tri-county buildings sit in each position, read live. */
async function getStandingCounts() {
  const count = async (
    refine: (query: ReturnType<typeof base>) => ReturnType<typeof base>
  ) => {
    const { count: value, error } = await refine(base());
    if (error) console.error("[for-boards]", error.message);
    return value ?? 0;
  };

  const base = () =>
    supabase
      .from("buildings")
      .select("*", { count: "exact", head: true })
      .eq("tri_county", "Yes");

  const [tracked, approved, expired, noneOnFile] = await Promise.all([
    count((q) => q),
    count((q) => q.eq("fha_status", "Approved")),
    count((q) => q.eq("fha_status", "Expired")),
    count((q) => q.is("fha_status", null)),
  ]);

  return { tracked, approved, expired, noneOnFile };
}

export default async function ForBoards() {
  const counts = await getStandingCounts();
  const path = "/for-boards";

  return (
    <>
      <JsonLd
        schemas={[
          articleSchema(
            "For condo boards: getting your building back on the lenders' lists",
            "What FHA and GSE standing does to resale values in your building, and what re-approval involves.",
            path,
            "2026-08-08"
          ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "For boards", path },
          ]),
        ]}
      />
      <Masthead />

      <section className={styles.page}>
        <div className="wrap">
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "For boards" }]} />

          {/* Hero — the sentence a board director recognises immediately. */}
          <header className={styles.hero}>
            <div className={`${styles.kicker} mono`}>For condo boards</div>
            <h1>
              Lost FHA approval and sales stalled? We help get buildings back on
              the lists lenders use.
            </h1>
            <p className={styles.lede}>
              When a building isn&rsquo;t on the lists, buyers who need financing
              can&rsquo;t close there — and most of them never find out why. They
              simply move on, and the board hears only that a unit sat and then
              sold under asking. Getting the standing back is paperwork, and it is
              work someone can do for your association.
            </p>
            <Link className={styles.heroBtn} href="/connect?intent=board">
              Talk to someone about our building
            </Link>
            <div className={styles.heroFine}>
              Free · no account required · no obligation
            </div>
          </header>

          <div className={styles.stats}>
            <Stat n={num(counts.tracked)} l="Tri-county buildings on file" />
            <Stat n={num(counts.approved)} l="Hold a current FHA approval" />
            <Stat n={num(counts.expired)} l="Approval lapsed — renewable" />
            <Stat n={num(counts.noneOnFile)} l="Nothing on file at all" />
          </div>
          <p className={styles.statsNote}>
            Read live from our buildings file. The largest group by far is
            buildings with nothing on file — which almost always means nobody ever
            applied, not that anyone was turned down.
          </p>

          <div className={styles.grid}>
            <main className={styles.main}>
              <section className={styles.block}>
                <h2 className={styles.blockHead}>What this costs your owners</h2>
                <ul className={styles.points}>
                  <li>
                    <b>A smaller buyer pool.</b> Without FHA or VA standing, buyers
                    using those loans are out. Without a workable conventional
                    review, a further slice goes. What remains is cash and
                    portfolio buyers — a real market, but a thinner one that prices
                    accordingly.
                  </li>
                  <li>
                    <b>Deals that die late.</b> Financing problems usually surface
                    weeks in, after inspection and after the seller has turned
                    other offers away. Each collapse resets the listing clock and
                    marks the unit.
                  </li>
                  <li>
                    <b>Values that drift down quietly.</b> Every owner in the
                    building sells into the same constraint. It rarely shows up as
                    a single event — it shows up as a pattern of slower sales at
                    softer numbers.
                  </li>
                  <li>
                    <b>Owners who can&rsquo;t refinance.</b> The same project rules
                    that block a buyer&rsquo;s loan can block an existing
                    owner&rsquo;s refinance.
                  </li>
                </ul>
              </section>

              <section className={styles.block}>
                <h2 className={styles.blockHead}>What re-approval actually involves</h2>
                <p className={styles.blockLede}>
                  None of this is a structural test. It is a documentation
                  exercise, and most of what it needs your association already
                  produces.
                </p>
                <ul className={styles.steps}>
                  <li>
                    <span className={styles.stepN}>1</span>
                    <span>
                      <b>Find out where you actually stand.</b> FHA and VA
                      positions are public record and dated. Conventional standing
                      is not publishable, so a licensed loan officer checks that
                      one directly.
                    </span>
                  </li>
                  <li>
                    <span className={styles.stepN}>2</span>
                    <span>
                      <b>Assemble the package.</b> Budget and reserve schedule,
                      insurance certificates, owner-occupancy and delinquency
                      figures, litigation position, and the governing documents.
                      An expired approval is the easiest case — the building
                      cleared review once already.
                    </span>
                  </li>
                  <li>
                    <span className={styles.stepN}>3</span>
                    <span>
                      <b>File it and answer the questions.</b> Applications come
                      back with follow-ups. Someone has to own that correspondence
                      and keep it moving, which is where most board-run attempts
                      stall.
                    </span>
                  </li>
                  <li>
                    <span className={styles.stepN}>4</span>
                    <span>
                      <b>Keep the questionnaire tight.</b> Lender questionnaires
                      arrive per deal. A slow or inconsistent one reads as a red
                      flag your building may not deserve.
                    </span>
                  </li>
                </ul>
                <p className={styles.blockNote}>
                  We are not a lender, a law firm or a management company, and we
                  don&rsquo;t file anything ourselves. We connect boards with
                  licensed professionals who do this work, and nothing here is a
                  promise about an outcome — approval rests with HUD, the VA or the
                  investor.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.blockHead}>Before you get in touch</h2>
                <p className={styles.blockLede}>
                  These make the first conversation useful. None of it is required.
                </p>
                <ul className={styles.points}>
                  <li>
                    <b>Look your building up.</b> Our record shows FHA and VA
                    standing with dates, plus milestone, reserve and recertification
                    signals — free, and no account needed.
                  </li>
                  <li>
                    <b>Know your last approval date</b>, if the association ever
                    held one.
                  </li>
                  <li>
                    <b>Have the current budget and reserve schedule to hand</b>, and
                    the milestone report if one has been completed.
                  </li>
                </ul>
                <div className={styles.linkRow}>
                  <Link href="/">Look up your building →</Link>
                  <Link href="/rules/fha-approval-and-single-unit">
                    How FHA approval works →
                  </Link>
                  <Link href="/rules/conventional-full-review-2026">
                    The 2026 conventional change →
                  </Link>
                  <Link href="/forms">Forms &amp; templates →</Link>
                </div>
              </section>

              <footer className={styles.disclaimer}>
                <p>
                  Nothing on this page is legal or financial advice, and none of it
                  is a statement about any particular association. We publish no
                  board member, officer or licensee details from any source.
                </p>
                <p className="mono">
                  Not affiliated with HUD, the VA, Fannie Mae, Freddie Mac or any
                  government agency
                </p>
              </footer>
            </main>

            <aside className={styles.side}>
              <ConnectCta
                lede="Tell us what your building needs. We'll pass it to licensed professionals who handle association approvals and lender questionnaires — free to the association, no obligation."
                actions={[
                  { intent: "board", label: "I'm on a condo board" },
                  { intent: "check-building", label: "Check our building" },
                  { intent: "finance", label: "Finance a purchase" },
                ]}
              />

              <nav className={styles.nearby} aria-label="Elsewhere">
                <div className={styles.nearbyHead}>Elsewhere</div>
                <ul>
                  <li>
                    <Link href="/rules">Rules &amp; requirements</Link>
                  </li>
                  <li>
                    <Link href="/associations">Association registry</Link>
                  </li>
                  <li>
                    <Link href="/forms">Forms &amp; templates</Link>
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
