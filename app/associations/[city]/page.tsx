import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import ConnectCta from "@/components/ConnectCta";
import JsonLd from "@/components/JsonLd";
import {
  associationHref,
  getAssociations,
  getAssociationsInCity,
  groupByCity,
  registrationLabel,
  registrationTone,
} from "@/lib/associations";
import { breadcrumbSchema } from "@/lib/schema";
import { num } from "@/lib/format";
import styles from "./page.module.css";

export const revalidate = 3600;

/** One page per city that has registry entries. */
export async function generateStaticParams() {
  const cities = groupByCity(await getAssociations());
  return cities.map((city) => ({ city: city.segment }));
}

async function cityName(segment: string): Promise<string | null> {
  const cities = groupByCity(await getAssociations());
  return cities.find((city) => city.segment === segment)?.city ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: { city: string };
}): Promise<Metadata> {
  const city = await cityName(params.city);
  if (!city) return { title: "City not found · SoFloCondoVerify" };

  return {
    title: `${city} condo & HOA association registry · SoFloCondoVerify`,
    description: `Association registration entries in ${city} — name, type, registration status and enforcement flag as they appear in the public ordinance registry.`,
  };
}

export default async function AssociationCityPage({
  params,
}: {
  params: { city: string };
}) {
  const city = await cityName(params.city);
  if (!city) notFound();

  const associations = await getAssociationsInCity(params.city);
  const enforcement = associations.filter((entry) => entry.enforcementOpen).length;
  const path = `/associations/${params.city}`;

  return (
    <>
      <JsonLd
        schemas={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Associations", path: "/associations" },
            { name: city, path },
          ]),
        ]}
      />
      <Masthead />

      <section className={styles.page}>
        <div className="wrap">
          <Breadcrumbs
            trail={[
              { name: "Home", href: "/" },
              { name: "Associations", href: "/associations" },
              { name: city },
            ]}
          />

          <header className={styles.head}>
            <div className={`${styles.doc} mono`}>Association registry</div>
            <h1>{city} condo and HOA associations</h1>
            <p className={styles.lede}>
              {num(associations.length)} registration entr
              {associations.length === 1 ? "y" : "ies"} on file for {city}
              {enforcement > 0
                ? `, ${num(enforcement)} carrying an open enforcement item`
                : ""}
              .
            </p>
            <p className={styles.warn}>
              <b>Registration standing only.</b> Everything on this page comes from
              an ordinance registration programme. It is not a structural,
              financial or safety assessment of any building, and an enforcement
              item is a registration matter.
            </p>
          </header>

          <div className={styles.grid}>
            <main>
              <ul className={styles.list}>
                {associations.map((association) => {
                  const href = associationHref(association);
                  return (
                    <li key={association.id} className={styles.row}>
                      {href ? (
                        <Link href={href} className={styles.rowName}>
                          {association.name}
                        </Link>
                      ) : (
                        <span className={styles.rowName}>{association.name}</span>
                      )}
                      <span className={`${styles.rowAddr} mono`}>
                        {association.address}
                      </span>
                      <span className={styles.chips}>
                        <span
                          className={`${styles.chip} ${
                            styles[`t_${registrationTone(association.registrationStatus)}`]
                          }`}
                        >
                          {registrationLabel(association.registrationStatus)}
                        </span>
                        {association.type && (
                          <span className={`${styles.chip} ${styles.t_none}`}>
                            {association.type}
                          </span>
                        )}
                        {association.enforcementOpen && (
                          <span className={`${styles.chip} ${styles.t_caution}`}>
                            Open enforcement item
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <nav className={styles.back} aria-label="Elsewhere">
                <Link href="/associations">← All cities</Link>
              </nav>
            </main>

            <aside className={styles.side}>
              <ConnectCta
                lede={`The registry shows registration standing in ${city} and nothing more. What a building's finances or structure look like takes a licensed professional.`}
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

      <footer className={styles.pageFoot}>
        <div className="wrap">
          <div>© 2026 SoFloCondoVerify.com · Miami-Dade · Broward · Palm Beach</div>
          <div>
            Independent record · Ads are labeled “Advertisement” · Not legal or
            financial advice
          </div>
        </div>
      </footer>
    </>
  );
}
