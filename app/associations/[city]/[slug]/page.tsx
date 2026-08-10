import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import ConnectCta from "@/components/ConnectCta";
import JsonLd from "@/components/JsonLd";
import SiteFooter from "@/components/SiteFooter";
import {
  getAssociationBySlug,
  getFirmsAtAddress,
  registrationLabel,
  registrationTone,
} from "@/lib/associations";
import { breadcrumbSchema } from "@/lib/schema";
import styles from "./page.module.css";

/**
 * ~4,000 entries, each cheap but not free to build. Rendered on demand and
 * cached for an hour rather than prebuilt; the city pages carry the links.
 */
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { city: string; slug: string };
}): Promise<Metadata> {
  const association = await getAssociationBySlug(params.city, params.slug);
  if (!association) return { title: "Association not found · SoFloCondoVerify" };

  return {
    title: `${association.name} — association registry record · SoFloCondoVerify`,
    description: `Public registration record for ${association.name} in ${association.city}: registration number, type, registration status and enforcement flag. Ordinance registration standing only.`,
  };
}

export default async function AssociationPage({
  params,
}: {
  params: { city: string; slug: string };
}) {
  const association = await getAssociationBySlug(params.city, params.slug);
  if (!association?.city) notFound();

  // Licensed businesses only. board_contacts and cam_licensees are gated
  // personal data and are never read on any public page.
  const firms = await getFirmsAtAddress(association);

  const path = `/associations/${params.city}/${params.slug}`;
  const cityPath = `/associations/${params.city}`;
  const tone = registrationTone(association.registrationStatus);

  return (
    <>
      <JsonLd
        schemas={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Associations", path: "/associations" },
            { name: association.city, path: cityPath },
            { name: association.name, path },
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
              { name: association.city, href: cityPath },
              { name: association.name },
            ]}
          />

          <div className={styles.grid}>
            <main className={styles.main}>
              <article className={styles.record}>
                <header className={styles.recHead}>
                  <div className={`${styles.doc} mono`}>
                    Association registration record
                  </div>
                  <h1>{association.name}</h1>
                  <div className={`${styles.addr} mono`}>{association.address}</div>
                  <div className={styles.badges}>
                    <span className={`${styles.badge} ${styles[`t_${tone}`]}`}>
                      {registrationLabel(association.registrationStatus)}
                    </span>
                    {association.type && (
                      <span className={`${styles.badge} ${styles.t_none}`}>
                        {association.type}
                      </span>
                    )}
                    {association.enforcementOpen && (
                      <span className={`${styles.badge} ${styles.t_caution}`}>
                        Open enforcement item
                      </span>
                    )}
                  </div>
                  <div className={`${styles.rid} mono`}>
                    REGISTRATION <b>#{association.registration}</b>
                    {association.regDate ? ` · Through ${association.regDate}` : ""}
                  </div>
                </header>

                <div className={styles.scope}>
                  <div className={styles.scopeHead}>What this record covers</div>
                  <p>
                    This is an <b>ordinance registration record</b>. It shows
                    whether the association is registered with the programme that
                    requires it, and whether an enforcement item is open on that
                    registration.
                  </p>
                  <p>
                    It is <b>not</b> a structural assessment, a financial
                    assessment, a reserve or insurance position, or a statement
                    about the building or anyone who lives in it. An enforcement
                    item here concerns registration — most often a filing that is
                    late or incomplete — and carries no structural meaning
                    whatsoever.
                  </p>
                </div>

                <table className={styles.facts}>
                  <tbody>
                    <Fact label="Registration number" value={association.registration} />
                    <Fact
                      label="Registration status"
                      value={registrationLabel(association.registrationStatus)}
                    />
                    <Fact
                      label="Enforcement item"
                      value={
                        association.enforcementOpen
                          ? "Open — registration matter"
                          : "None on file"
                      }
                    />
                    <Fact label="Association type" value={association.type} />
                    <Fact label="Registered through" value={association.regDate} />
                    <Fact label="Address on file" value={association.address} />
                    <Fact label="City" value={association.city} />
                  </tbody>
                </table>

                {firms.length > 0 && (
                  <section className={styles.firms}>
                    <div className={styles.firmsHead}>
                      Licensed management firms registered at this address
                    </div>
                    <p className={styles.firmsNote}>
                      These are licensed businesses whose registered address
                      matches the address above in a second public file.{" "}
                      <b>
                        That is co-location in two records, not evidence that a
                        firm manages this association
                      </b>{" "}
                      — ask the association if you need to know who manages it.
                    </p>
                    <ul className={styles.firmList}>
                      {firms.map((firm) => (
                        <li key={firm.id}>
                          <span className={styles.firmName}>{firm.name}</span>
                          <span className={`${styles.firmMeta} mono`}>
                            {[
                              firm.street,
                              firm.city,
                              firm.license ? `Licence ${firm.license}` : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <footer className={styles.recFoot}>
                  <p>
                    Compiled from the public association registry. Registration
                    status changes when an association files, so confirm the
                    current position with the registry or the association itself
                    before relying on it. We publish no board members, officers or
                    licensee details from any source.
                  </p>
                  <p className="mono">
                    Not legal or financial advice · Not affiliated with any
                    government agency
                  </p>
                </footer>
              </article>

              <nav className={styles.related} aria-label="Related">
                <div className={styles.relatedHead}>Related</div>
                <ul>
                  <li>
                    <Link href={cityPath}>All {association.city} associations</Link>
                  </li>
                  <li>
                    <Link href="/associations">Every city in the registry</Link>
                  </li>
                  <li>
                    <Link href="/rules/chapter-718-condo-act">
                      What Chapter 718 requires of an association
                    </Link>
                  </li>
                  <li>
                    <Link href="/">Look up the building&rsquo;s verification record</Link>
                  </li>
                </ul>
              </nav>
            </main>

            <aside className={styles.side}>
              <ConnectCta
                lede="Registration standing is one narrow record. Reserves, structure and what a lender will actually do here are separate questions, and each takes someone licensed to answer."
                actions={[
                  { intent: "check-building", label: "Ask about this building" },
                  { intent: "board", label: "I'm on this board" },
                  { intent: "finance", label: "Finance a purchase" },
                  { intent: "sell", label: "Sell my unit" },
                ]}
              />

              <div className={styles.note}>
                <div className={styles.noteHead}>What we don&rsquo;t publish</div>
                <p>
                  Board members, association officers and individual licensee
                  records are personal data. We hold some of it under lock and
                  publish none of it — not here, not anywhere on this site.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}

function Fact({ label, value }: { label: string; value: string | null }) {
  const clean = value?.trim();
  if (!clean) return null;

  return (
    <tr>
      <th scope="row" className={styles.factL}>
        {label}
      </th>
      <td className={styles.factV}>{clean}</td>
    </tr>
  );
}
