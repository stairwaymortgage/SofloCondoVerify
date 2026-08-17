import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import ConnectCta from "@/components/ConnectCta";
import JsonLd from "@/components/JsonLd";
import SiteFooter from "@/components/SiteFooter";
import { RULE_TOPICS, getStatutes } from "@/lib/rules";
import { breadcrumbSchema } from "@/lib/schema";
import styles from "./page.module.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Florida condo rules, explained",
  description:
    "Chapter 718 records law, SB 4D milestone inspections, structural integrity reserve studies, the 2026 conventional Full Review change and FHA project approval — in plain English, with the citations.",
  alternates: { canonical: "/rules" },
};

export default async function RulesIndex() {
  const statutes = await getStatutes();

  return (
    <>
      <JsonLd
        schemas={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Rules", path: "/rules" },
          ]),
        ]}
      />
      <Masthead />

      <section className={styles.page}>
        <div className="wrap">
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "Rules" }]} />

          <header className={styles.head}>
            <div className={`${styles.doc} mono`}>Rules &amp; requirements</div>
            <h1>The rules behind the record</h1>
            <p className={styles.lede}>
              Every status on this site traces back to a rule — a Florida statute,
              a federal programme, or an investor policy that isn&rsquo;t law at
              all. These pages explain which is which, what each one actually
              requires, and what it means when a filing is missing.
            </p>
          </header>

          <div className={styles.grid}>
            <main className={styles.main}>
              <ul className={styles.topics}>
                {RULE_TOPICS.map((topic) => (
                  <li key={topic.slug}>
                    <Link href={`/rules/${topic.slug}`} className={styles.topicLink}>
                      <span className={styles.topicTitle}>{topic.title}</span>
                      <span className={styles.topicStand}>{topic.standfirst}</span>
                      <span className={`${styles.topicAuth} mono`}>
                        {topic.authority}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className={styles.note}>
                <div className={styles.noteHead}>How to read these pages</div>
                <p>
                  These are explainers, not advice, and they describe rules in
                  general rather than any particular building or association. Where
                  a page quotes a statute it gives the citation and the source the
                  text came from; where a rule is investor policy rather than law,
                  the page says so instead of borrowing a citation that
                  doesn&rsquo;t apply. Statutes and programme rules change — check
                  the as-of date, and take anything that affects a decision to a
                  Florida attorney or a licensed loan officer.
                </p>
                <p className="mono">
                  {statutes.length} statute provisions on file · Not legal or
                  financial advice · Not affiliated with any government agency
                </p>
              </div>
            </main>

            <aside className={styles.side}>
              <ConnectCta
                lede="Rules describe the general position. What a specific building or lender will do with yours is a conversation with someone licensed — free, and no obligation."
                actions={[
                  { intent: "check-building", label: "Ask about a building" },
                  { intent: "finance", label: "Finance a purchase" },
                  { intent: "board", label: "I'm on a condo board" },
                ]}
              />

              <nav className={styles.nearby} aria-label="Elsewhere">
                <div className={styles.nearbyHead}>Elsewhere</div>
                <ul>
                  <li>
                    <Link href="/forms">Forms &amp; templates</Link>
                  </li>
                  <li>
                    <Link href="/for-boards">For condo boards</Link>
                  </li>
                  <li>
                    <Link href="/">Look up a specific building</Link>
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
