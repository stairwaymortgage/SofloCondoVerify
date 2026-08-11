import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import ConnectCta from "@/components/ConnectCta";
import JsonLd from "@/components/JsonLd";
import SiteFooter from "@/components/SiteFooter";
import { RULE_TOPICS, getStatutesForTopic, ruleTopic } from "@/lib/rules";
import { faqHref } from "@/lib/faq";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import { supabase } from "@/lib/supabase";
import type { Faq, Statute } from "@/lib/database.types";
import styles from "./page.module.css";

export const revalidate = 3600;

/** Five hand-written topics — all prebuilt. */
export function generateStaticParams() {
  return RULE_TOPICS.map((topic) => ({ topic: topic.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { topic: string };
}): Promise<Metadata> {
  const topic = ruleTopic(params.topic);
  if (!topic) return { title: "Rule not found · SoFloCondoVerify" };

  return {
    title: `${topic.title} · SoFloCondoVerify`,
    description: topic.standfirst,
    alternates: { canonical: `/rules/${topic.slug}` },
  };
}

/**
 * A handful of city answers from the matching cluster, to tie the general rule
 * back to somewhere specific. Not city-targeted — this page has no city.
 */
async function getClusterFaqs(cluster: string | null): Promise<Faq[]> {
  if (!cluster) return [];

  const { data, error } = await supabase
    .from("faq")
    .select("*")
    .eq("cluster", cluster)
    .order("id")
    .limit(60);

  if (error) {
    console.error("[rules/faq]", error.message);
    return [];
  }

  // One per city, so the list reads as a spread rather than six Aventura rows.
  const seen = new Set<string>();
  const picked: Faq[] = [];
  for (const faq of (data ?? []) as Faq[]) {
    const city = faq.city ?? "";
    if (seen.has(city)) continue;
    if ((faq.answer?.trim().length ?? 0) < 180) continue;
    seen.add(city);
    picked.push(faq);
    if (picked.length === 6) break;
  }
  return picked;
}

export default async function RulePage({ params }: { params: { topic: string } }) {
  const topic = ruleTopic(params.topic);
  if (!topic) notFound();

  const [statutes, faqs] = await Promise.all([
    getStatutesForTopic(topic),
    getClusterFaqs(topic.faqCluster),
  ]);

  const asOf = statutes[0]?.created_at
    ? new Date(statutes[0].created_at).toISOString().slice(0, 10)
    : "2026-08-08";
  const path = `/rules/${topic.slug}`;

  return (
    <>
      <JsonLd
        schemas={[
          articleSchema(topic.title, topic.standfirst, path, asOf),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Rules", path: "/rules" },
            { name: topic.title, path },
          ]),
        ]}
      />
      <Masthead />

      <section className={styles.page}>
        <div className="wrap">
          <Breadcrumbs
            trail={[
              { name: "Home", href: "/" },
              { name: "Rules", href: "/rules" },
              { name: topic.title },
            ]}
          />

          <div className={styles.grid}>
            <main className={styles.main}>
              <article className={styles.article}>
                <header className={styles.head}>
                  <div className={`${styles.doc} mono`}>Rules &amp; requirements</div>
                  <h1>{topic.title}</h1>
                  <p className={styles.stand}>{topic.standfirst}</p>
                  <div className={`${styles.meta} mono`}>
                    {topic.authority} · Read {asOf}
                  </div>
                </header>

                <div className={styles.body}>
                  {topic.body.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>

                {statutes.length > 0 ? (
                  <>
                    <div className={styles.tableHead}>
                      What the statute says
                      <span className={`${styles.tableN} mono`}>
                        {statutes.length} provision{statutes.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th scope="col">Citation</th>
                          <th scope="col">Requirement</th>
                          <th scope="col">Deadline / retention</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statutes.map((statute) => (
                          <StatuteRow key={statute.id} statute={statute} />
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <div className={styles.noStatute}>
                    <b>No statute applies to this one.</b> The rules on this page
                    come from a federal programme or an investor&rsquo;s selling
                    guide rather than Florida law, so there is no citation to give
                    — and we would rather say that than attach one that
                    doesn&rsquo;t govern it.
                  </div>
                )}

                <div className={styles.actions}>
                  <div className={styles.actionsHead}>What to do with this</div>
                  <ul>
                    {topic.actions.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>

                <footer className={styles.sources}>
                  <div className={styles.sourcesHead}>Source &amp; as-of</div>
                  <p>
                    {topic.authority}. Provisions above were read into our file on{" "}
                    <b>{asOf}</b>
                    {statutes[0]?.source_doc
                      ? ` from source document ${statutes[0].source_doc}`
                      : ""}
                    . Statutes and programme rules are amended; confirm the current
                    text with the Florida Legislature, HUD or the investor before
                    relying on it.
                  </p>
                  <p>
                    This is general information about rules, not advice, and not a
                    statement about any particular building or association.
                  </p>
                  <p className="mono">
                    Not legal or financial advice · Not affiliated with any
                    government agency
                  </p>
                </footer>
              </article>

              {faqs.length > 0 && (
                <nav className={styles.related} aria-label="Related questions">
                  <div className={styles.relatedHead}>
                    How this plays out city by city
                  </div>
                  <ul>
                    {faqs.map((faq) => {
                      const href = faqHref(faq);
                      return href ? (
                        <li key={faq.id}>
                          <Link href={href}>{faq.question}</Link>
                          <span className={`${styles.relatedMeta} mono`}>
                            {faq.city}
                          </span>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </nav>
              )}

              <nav className={styles.more} aria-label="Other rules">
                <div className={styles.moreHead}>Other rules</div>
                <ul>
                  {RULE_TOPICS.filter((other) => other.slug !== topic.slug).map(
                    (other) => (
                      <li key={other.slug}>
                        <Link href={`/rules/${other.slug}`}>{other.title}</Link>
                      </li>
                    )
                  )}
                </ul>
              </nav>
            </main>

            <aside className={styles.side}>
              <ConnectCta
                lede="Rules describe the general position. What a specific building or lender does with yours takes someone licensed to look at it — free, and no obligation."
                actions={[
                  { intent: "check-building", label: "Ask about a building" },
                  { intent: "finance", label: "Finance a purchase" },
                  { intent: "board", label: "I'm on a condo board" },
                  { intent: "sell", label: "Sell my unit" },
                ]}
              />

              <nav className={styles.nearby} aria-label="Elsewhere">
                <div className={styles.nearbyHead}>Elsewhere</div>
                <ul>
                  <li>
                    <Link href="/rules">All rules &amp; requirements</Link>
                  </li>
                  <li>
                    <Link href="/forms">Forms &amp; templates</Link>
                  </li>
                  <li>
                    <Link href="/for-boards">For condo boards</Link>
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

function StatuteRow({ statute }: { statute: Statute }) {
  return (
    <tr>
      <th scope="row" className={styles.cite}>
        <span className="mono">{statute.citation}</span>
        <span className={styles.topicName}>{statute.topic}</span>
      </th>
      <td className={styles.req}>{statute.requirement_threshold}</td>
      <td className={styles.deadline}>{statute.retention_deadline}</td>
    </tr>
  );
}
