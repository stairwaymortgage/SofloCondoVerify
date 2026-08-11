import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import ConnectCta from "@/components/ConnectCta";
import JsonLd from "@/components/JsonLd";
import SiteFooter from "@/components/SiteFooter";
import {
  faqHref,
  getFaqBySlug,
  getFaqHub,
  getRelatedFaqs,
  isThin,
} from "@/lib/faq";
import { cityHubHref, countyByDb } from "@/lib/cities";
import { breadcrumbSchema, faqPageSchema } from "@/lib/schema";
import type { Faq } from "@/lib/database.types";
import styles from "./page.module.css";

export const revalidate = 3600;

/**
 * No generateStaticParams: prebuilding all 7,371 publishable answers pushed the
 * build past ten minutes, since each page costs three Supabase round-trips.
 * They render on first request and cache for an hour instead — the pages are
 * light, and they enter the index through sitemap-faq.xml either way. Answers
 * that fail the thin guard still resolve here but carry noindex and appear in
 * no sitemap or index list.
 */

/** The FAQ must live at the route it was requested from, or it 404s. */
async function resolve(params: {
  county: string;
  city: string;
  slug: string;
}): Promise<Faq | null> {
  const faq = await getFaqBySlug(params.slug);
  if (!faq) return null;

  const expected = faqHref(faq);
  const actual = `/condos/${params.county}/${params.city}/faq/${params.slug}`;
  return expected === actual ? faq : null;
}

export async function generateMetadata({
  params,
}: {
  params: { county: string; city: string; slug: string };
}): Promise<Metadata> {
  const faq = await resolve(params);
  if (!faq) return { title: "Answer not found · SoFloCondoVerify" };

  const description = (faq.answer ?? "").trim().slice(0, 300);

  return {
    title: `${faq.question} · SoFloCondoVerify`,
    description,
    // resolve() already refused anything that isn't the one true route for
    // this answer, so faqHref is by definition self-referencing here.
    alternates: { canonical: faqHref(faq) ?? undefined },
    // Thin answers stay reachable and linked, but out of the index.
    robots: isThin(faq) ? { index: false, follow: true } : undefined,
  };
}

export default async function FaqPage({
  params,
}: {
  params: { county: string; city: string; slug: string };
}) {
  const faq = await resolve(params);
  if (!faq || !faq.question) notFound();

  const hub = await getFaqHub(faq);
  const county = countyByDb(hub?.county ?? faq.county);
  const hubHref = hub ? cityHubHref(hub) : null;
  const related = await getRelatedFaqs(faq);

  const city = hub?.city ?? faq.city ?? "";
  const answer = (faq.answer ?? "").trim();
  const paragraphs = answer.split(/\n{2,}/).filter(Boolean);
  const asOf = new Date(faq.created_at).toISOString().slice(0, 10);
  const path = `/condos/${params.county}/${params.city}/faq/${params.slug}`;
  const thin = isThin(faq);

  const trail = [
    { name: "Home", href: "/" },
    ...(county ? [{ name: `${county.name} County`, href: `/condos/${county.slug}` }] : []),
    ...(city && hubHref ? [{ name: city, href: hubHref }] : []),
    { name: faq.cluster?.trim() || "Answer" },
  ];

  return (
    <>
      <JsonLd
        schemas={[
          // FAQPage markup is only claimed for answers substantial enough to
          // deserve it — see the thin-content guard in lib/faq.
          ...(thin ? [] : [faqPageSchema(faq.question, answer, path)]),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            ...(county
              ? [{ name: `${county.name} County`, path: `/condos/${county.slug}` }]
              : []),
            ...(city && hubHref ? [{ name: city, path: hubHref }] : []),
            { name: faq.question, path },
          ]),
        ]}
      />
      <Masthead />

      <section className={styles.page}>
        <div className="wrap">
          <Breadcrumbs trail={trail} />

          <div className={styles.grid}>
            <main className={styles.main}>
              <article className={styles.answer}>
                <header className={styles.head}>
                  <div className={`${styles.doc} mono`}>
                    {[city, faq.cluster].filter(Boolean).join(" · ")}
                  </div>
                  <h1>{faq.question}</h1>
                </header>

                <div className={styles.body}>
                  {paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>

                <div className={styles.sources}>
                  <div className={styles.sourcesHead}>Sources &amp; as-of</div>
                  <p>
                    Read from HUD&rsquo;s condominium list, the VA condominium
                    report, FL DBPR filings and county registry and building
                    records, compiled <b>{asOf}</b>. Figures describe what was on
                    file that day; a missing filing is recorded as unconfirmed
                    rather than as a finding, and conventional (Fannie/Freddie)
                    standing is not publishable in either direction.
                  </p>
                  <p className="mono">
                    Not legal or financial advice · Not affiliated with any
                    government agency
                  </p>
                </div>
              </article>

              {hubHref && city && (
                <Link className={styles.hubLink} href={hubHref}>
                  <span className={styles.hubLinkHead}>
                    ← All {city} condo verification data
                  </span>
                  <span className={styles.hubLinkBody}>
                    Current building counts, FHA and VA standing, preconstruction,
                    and every answer we hold for {city}.
                  </span>
                </Link>
              )}

              {related.length > 0 && (
                <nav className={styles.related} aria-label="Related questions">
                  <div className={styles.relatedHead}>
                    More {city} questions
                  </div>
                  <ul>
                    {related.map((other) => {
                      const href = faqHref(other);
                      return href ? (
                        <li key={other.id}>
                          <Link href={href}>{other.question}</Link>
                          <span className={`${styles.relatedMeta} mono`}>
                            {other.cluster}
                          </span>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </nav>
              )}
            </main>

            <aside className={styles.side}>
              <ConnectCta
                lede={`Answers here describe the public record. What a specific lender will do on a specific ${
                  city || "South Florida"
                } building is a question for a licensed professional — free, and no obligation.`}
                actions={[
                  { intent: "check-building", label: "Ask about a building" },
                  { intent: "finance", label: "Finance a purchase" },
                  { intent: "foreign-national", label: "Foreign-national loan" },
                  { intent: "sell", label: "Sell my unit" },
                ]}
              />

              <nav className={styles.nearby} aria-label="Elsewhere">
                <div className={styles.nearbyHead}>Elsewhere</div>
                <ul>
                  {hubHref && city && (
                    <li>
                      <Link href={hubHref}>{city} condo hub</Link>
                    </li>
                  )}
                  {county && (
                    <li>
                      <Link href={`/condos/${county.slug}`}>
                        All {county.name} County cities
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link href="/">Look up a specific building</Link>
                  </li>
                  <li>
                    <Link href="/preconstruction">Preconstruction projects</Link>
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
