import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import ConnectCta from "@/components/ConnectCta";
import JsonLd from "@/components/JsonLd";
import SiteFooter from "@/components/SiteFooter";
import {
  COUNTIES,
  cityHubHref,
  countyBySlug,
  countyHref,
  countsFor,
  getCityHubsInCounty,
  getCountyCityCounts,
  getLiveCounts,
} from "@/lib/cities";
import { breadcrumbSchema } from "@/lib/schema";
import { num } from "@/lib/format";
import styles from "./page.module.css";

export const revalidate = 3600;

/** Three counties, all prebuilt. */
export function generateStaticParams() {
  return COUNTIES.map((county) => ({ county: county.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { county: string };
}): Promise<Metadata> {
  const county = countyBySlug(params.county);
  if (!county) return { title: "County not found · SoFloCondoVerify" };

  return {
    title: `${county.name} County condos — verification by city · SoFloCondoVerify`,
    description: `Every ${county.name} County city we track, with current counts of condo buildings, FHA-approved and VA-accepted projects, preconstruction, and buildings carrying flagged signals.`,
    // countyBySlug matches case-insensitively; the canonical is the lowercase
    // slug it resolved to, so /condos/Miami-Dade doesn't self-canonicalise.
    alternates: { canonical: countyHref(county) },
  };
}

export default async function CountyHub({ params }: { params: { county: string } }) {
  const county = countyBySlug(params.county);
  if (!county) notFound();

  const [hubs, cityCounts, totals] = await Promise.all([
    getCityHubsInCounty(county),
    getCountyCityCounts(county),
    getLiveCounts(county, null),
  ]);

  const cities = hubs
    .map((hub) => ({ hub, href: cityHubHref(hub), counts: countsFor(cityCounts, hub.city) }))
    .filter((entry) => entry.href !== null)
    .sort(
      (a, b) =>
        b.counts.total - a.counts.total ||
        (a.hub.city ?? "").localeCompare(b.hub.city ?? "", "en")
    );

  const withStock = cities.filter((entry) => entry.counts.total > 0);
  const withoutStock = cities.filter((entry) => entry.counts.total === 0);

  return (
    <>
      <JsonLd
        schemas={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: `${county.name} County`, path: `/condos/${county.slug}` },
          ]),
        ]}
      />
      <Masthead />

      <section className={styles.page}>
        <div className="wrap">
          <Breadcrumbs
            trail={[{ name: "Home", href: "/" }, { name: `${county.name} County` }]}
          />

          <header className={styles.head}>
            <div className={`${styles.doc} mono`}>County index</div>
            <h1>{county.name} County condos</h1>
            <p className={styles.lede}>
              {num(totals.total)} condo buildings across{" "}
              {withStock.length} {county.name} cities, each read against the same
              seven public sources. Pick a city for its current counts, its
              answers, and the buildings worth a closer look.
            </p>
          </header>

          <div className={styles.stats}>
            <Stat n={num(totals.total)} l="Buildings tracked" />
            <Stat n={num(totals.fhaApproved)} l="FHA approved" />
            <Stat n={num(totals.vaAccepted)} l="VA accepted" />
            <Stat n={num(totals.precon)} l="Preconstruction" />
            <Stat n={num(totals.flagged)} l="2+ signals flagged" />
          </div>
          <p className={styles.statsNote}>
            Counts are read from the buildings file on each refresh, not from a
            stored snapshot. Approval counts reflect what is on file today; a
            building with nothing on file is unconfirmed, not rejected.
          </p>

          <div className={styles.grid}>
            <main>
              <h2 className={styles.sectionHead}>Cities</h2>
              <ul className={styles.cards}>
                {withStock.map(({ hub, href, counts }) => (
                  <li key={hub.id} className={styles.card}>
                    <Link href={href!} className={styles.cardLink}>
                      <span className={styles.cardName}>{hub.city}</span>
                      {hub.identity_nickname && (
                        <span className={styles.cardTag}>
                          {hub.identity_nickname}
                        </span>
                      )}
                      <span className={styles.cardStats}>
                        <span className={`${styles.cardStat} mono`}>
                          {num(counts.total)} buildings
                        </span>
                        {counts.flagged > 0 && (
                          <span className={`${styles.cardStat} mono`}>
                            {counts.flagged} flagged
                          </span>
                        )}
                        {counts.precon > 0 && (
                          <span className={`${styles.cardStat} mono`}>
                            {counts.precon} precon
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              {withoutStock.length > 0 && (
                <>
                  <h2 className={styles.sectionHead}>
                    Cities with no tracked condo stock
                  </h2>
                  <p className={styles.thinNote}>
                    We hold a page for each of these, but the public record shows
                    no condo buildings for them in our file today.
                  </p>
                  <ul className={styles.thinList}>
                    {withoutStock.map(({ hub, href }) => (
                      <li key={hub.id}>
                        <Link href={href!}>{hub.city}</Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <nav className={styles.otherCounties} aria-label="Other counties">
                <span className={styles.otherLabel}>Other counties:</span>
                {COUNTIES.filter((other) => other.slug !== county.slug).map(
                  (other) => (
                    <Link key={other.slug} href={`/condos/${other.slug}`}>
                      {other.name}
                    </Link>
                  )
                )}
                <Link href="/preconstruction">Preconstruction</Link>
              </nav>
            </main>

            <aside className={styles.side}>
              <ConnectCta
                lede="The record shows what was filed. Whether a lender will write the loan on a specific building takes a licensed professional — that part is free."
                actions={[
                  { intent: "finance", label: "Finance a purchase" },
                  { intent: "foreign-national", label: "Foreign-national loan" },
                  { intent: "sell", label: "Sell my unit" },
                  { intent: "check-building", label: "Check a building" },
                ]}
              />
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
