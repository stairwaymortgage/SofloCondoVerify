import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import ConnectCta from "@/components/ConnectCta";
import JsonLd from "@/components/JsonLd";
import SiteFooter from "@/components/SiteFooter";
import { getAssociations, groupByCity } from "@/lib/associations";
import { breadcrumbSchema } from "@/lib/schema";
import { num } from "@/lib/format";
import styles from "./page.module.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Condo & HOA association registry by city · SoFloCondoVerify",
  description:
    "Association registration records by city — registration status, type and enforcement flags as they appear in the public ordinance registry. Registration standing only; not a structural or financial assessment.",
  alternates: { canonical: "/associations" },
};

export default async function AssociationsIndex() {
  const associations = await getAssociations();
  const cities = groupByCity(associations);

  const totals = associations.reduce(
    (acc, association) => ({
      total: acc.total + 1,
      issued: acc.issued + (association.registrationStatus === "Issued" ? 1 : 0),
      enforcement: acc.enforcement + (association.enforcementOpen ? 1 : 0),
    }),
    { total: 0, issued: 0, enforcement: 0 }
  );

  return (
    <>
      <JsonLd
        schemas={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Associations", path: "/associations" },
          ]),
        ]}
      />
      <Masthead />

      <section className={styles.page}>
        <div className="wrap">
          <Breadcrumbs
            trail={[{ name: "Home", href: "/" }, { name: "Associations" }]}
          />

          <header className={styles.head}>
            <div className={`${styles.doc} mono`}>Association registry</div>
            <h1>Condo and HOA associations by city</h1>
            <p className={styles.lede}>
              Registration entries as they appear in the public association
              registry — the name on file, the registration status, and whether an
              enforcement item is open.
            </p>
            <p className={styles.warn}>
              <b>Registration standing only.</b> These are ordinance registration
              records. They say nothing about a building&rsquo;s structure, its
              reserves, its finances or its safety, and an enforcement item here is
              a registration matter — never a structural finding.
            </p>
          </header>

          <div className={styles.stats}>
            <Stat n={num(totals.total)} l="Registry entries" />
            <Stat n={num(totals.issued)} l="Registration issued" />
            <Stat n={num(totals.enforcement)} l="Open enforcement item" />
            <Stat n={num(cities.length)} l="Cities" />
          </div>

          <div className={styles.grid}>
            <main>
              <h2 className={styles.sectionHead}>Cities</h2>
              <ul className={styles.cards}>
                {cities.map((city) => (
                  <li key={city.segment} className={styles.card}>
                    <Link
                      href={`/associations/${city.segment}`}
                      className={styles.cardLink}
                    >
                      <span className={styles.cardName}>{city.city}</span>
                      <span className={styles.cardStats}>
                        <span className={`${styles.cardStat} mono`}>
                          {num(city.total)} entries
                        </span>
                        {city.enforcement > 0 && (
                          <span className={`${styles.cardStat} mono`}>
                            {city.enforcement} with enforcement
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <p className={styles.foot}>
                Entries whose address doesn&rsquo;t resolve to a city we track are
                held back rather than filed under a guess. We do not publish board
                members, officers or licensee details from any source.
              </p>
            </main>

            <aside className={styles.side}>
              <ConnectCta
                lede="Registration is one narrow record. If you need to know what a building's finances or structure actually look like, that takes a licensed professional — free, and no obligation."
                actions={[
                  { intent: "check-building", label: "Ask about a building" },
                  { intent: "board", label: "I'm on a condo board" },
                  { intent: "finance", label: "Finance a purchase" },
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
