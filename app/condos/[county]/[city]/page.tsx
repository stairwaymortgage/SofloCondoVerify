import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import ConnectCta from "@/components/ConnectCta";
import JsonLd from "@/components/JsonLd";
import SponsorSlot from "@/components/SponsorSlot";
import SiteFooter from "@/components/SiteFooter";
import {
  cityHubHref,
  citySlug,
  countyByDb,
  countyBySlug,
  getApprovedBuildings,
  getCityHub,
  getCityHubs,
  getFlaggedBuildings,
  getLiveCounts,
  type CityBuilding,
  type County,
} from "@/lib/cities";
import { faqHref, getFaqsForHub, groupByCluster, isThin } from "@/lib/faq";
import { getPreconInArea, preconHref, statusLabel } from "@/lib/precon";
import { breadcrumbSchema } from "@/lib/schema";
import { num } from "@/lib/format";
import type { CityHub } from "@/lib/database.types";
import styles from "./page.module.css";

export const revalidate = 3600;

/** All 104 hubs prebuild — they are the entry point for organic traffic. */
export async function generateStaticParams() {
  const hubs = await getCityHubs();
  return hubs
    .map((hub) => ({ county: countyByDb(hub.county)?.slug, city: citySlug(hub) }))
    .filter((params): params is { county: string; city: string } =>
      Boolean(params.county && params.city)
    );
}

export async function generateMetadata({
  params,
}: {
  params: { county: string; city: string };
}): Promise<Metadata> {
  const hub = await getCityHub(params.county, params.city);
  if (!hub) return { title: "City not found · SoFloCondoVerify" };

  const county = countyByDb(hub.county);
  return {
    title: `${headline(hub)} — verification record · SoFloCondoVerify`,
    description: `Condo verification for ${hub.city}, ${
      county?.name ?? "South Florida"
    }: current counts of FHA-approved and VA-accepted buildings, preconstruction, buildings carrying flagged signals, and answers to the questions buyers and sellers ask here.`,
  };
}

/** H1 uses the workbook's primary keyword where there is one. */
function headline(hub: CityHub): string {
  return hub.primary_keyword?.trim() || `${hub.city} condos`;
}

export default async function CityHubPage({
  params,
}: {
  params: { county: string; city: string };
}) {
  const county = countyBySlug(params.county);
  const hub = county ? await getCityHub(params.county, params.city) : null;
  if (!county || !hub || !hub.city) notFound();

  const city = hub.city;
  const [counts, faqs, flagged, approved, precon] = await Promise.all([
    getLiveCounts(county, city),
    getFaqsForHub(hub.id),
    getFlaggedBuildings(county, city),
    getApprovedBuildings(county, city),
    getPreconInArea(city),
  ]);

  const clusters = groupByCluster(faqs.filter((faq) => !isThin(faq)));
  const href = cityHubHref(hub) ?? `/condos/${county.slug}/${params.city}`;

  return (
    <>
      <JsonLd
        schemas={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: `${county.name} County`, path: `/condos/${county.slug}` },
            { name: city, path: href },
          ]),
        ]}
      />
      <Masthead />

      <section className={styles.page}>
        <div className="wrap">
          <Breadcrumbs
            trail={[
              { name: "Home", href: "/" },
              { name: `${county.name} County`, href: `/condos/${county.slug}` },
              { name: city },
            ]}
          />

          <header className={styles.head}>
            <div className={`${styles.doc} mono`}>
              City hub · {county.name} County
            </div>
            <h1>{headline(hub)}</h1>
            {intro(hub, county).map((paragraph, index) => (
              <p key={index} className={styles.lede}>
                {paragraph}
              </p>
            ))}
          </header>

          {/* Live counts — read from buildings, not the workbook snapshot. */}
          <div className={styles.stats}>
            <Stat n={num(counts.total)} l="Buildings tracked" />
            {/* Green marks a real approval on file — never a zero. */}
            <Stat
              n={num(counts.fhaApproved)}
              l="FHA approved"
              tone={counts.fhaApproved > 0 ? "go" : undefined}
            />
            <Stat
              n={num(counts.vaAccepted)}
              l="VA accepted"
              tone={counts.vaAccepted > 0 ? "go" : undefined}
            />
            <Stat n={num(counts.precon)} l="Preconstruction" />
            <Stat n={num(counts.flagged)} l="2+ signals flagged" />
          </div>
          <p className={styles.statsNote}>
            Read from the buildings file on each refresh rather than a stored
            snapshot, so these move as filings do. A building with no approval on
            file is <b>unconfirmed</b> — that is not a rejection, and usually means
            nobody applied. Conventional (Fannie/Freddie) standing is not
            publishable and is not counted here.
          </p>

          <div className={styles.grid}>
            <main className={styles.main}>
              {/* Paid placement, labeled — the neutral matching card in the
                  sidebar is unaffected by it. */}
              <SponsorSlot page="city" variant="leaderboard" />

              {/* ---- buildings ---- */}
              {(flagged.length > 0 || approved.length > 0) && (
                <section className={styles.block}>
                  <h2 className={styles.blockHead}>Buildings in {city}</h2>

                  {approved.length > 0 && (
                    <>
                      <h3 className={styles.subHead}>
                        Carrying an agency approval on file
                      </h3>
                      <ul className={styles.buildingList}>
                        {approved.map((building) => (
                          <BuildingRow key={building.id} building={building} />
                        ))}
                      </ul>
                    </>
                  )}

                  {flagged.length > 0 && (
                    <>
                      <h3 className={styles.subHead}>
                        Carrying two or more flagged signals
                      </h3>
                      <p className={styles.subNote}>
                        Each of these has a due-diligence read: the same record
                        ordered by what to look into first. Flags are public-record
                        facts to follow up on, not findings about a building.
                      </p>
                      <ul className={styles.buildingList}>
                        {flagged.map((building) => (
                          <BuildingRow key={building.id} building={building} risk />
                        ))}
                      </ul>
                    </>
                  )}
                </section>
              )}

              {/* ---- preconstruction ---- */}
              {precon.length > 0 && (
                <section className={styles.block}>
                  <h2 className={styles.blockHead}>
                    Preconstruction in {city}
                  </h2>
                  <ul className={styles.linkList}>
                    {precon.map((project) => (
                      <li key={project.slug}>
                        <Link href={preconHref(project)}>{project.project}</Link>
                        <span className={`${styles.linkMeta} mono`}>
                          {[statusLabel(project.status), project.deliveryYear]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link className={styles.moreLink} href="/preconstruction">
                    All South Florida preconstruction →
                  </Link>
                </section>
              )}

              {/* ---- FAQ clusters ---- */}
              {clusters.length > 0 && (
                <section className={styles.block}>
                  <h2 className={styles.blockHead}>
                    {city} condo questions, answered
                  </h2>
                  <p className={styles.subNote}>
                    {faqs.length} answers for this city, grouped by topic. Each one
                    cites what the public record shows and the date it was read.
                  </p>
                  {clusters.map((group) => (
                    <div key={group.cluster} className={styles.cluster}>
                      <h3 className={styles.clusterHead}>
                        {group.cluster}
                        <span className={`${styles.clusterN} mono`}>
                          {group.faqs.length}
                        </span>
                      </h3>
                      <ul className={styles.faqList}>
                        {group.faqs.map((faq) => {
                          const link = faqHref(faq);
                          return link ? (
                            <li key={faq.id}>
                              <Link href={link}>{faq.question}</Link>
                            </li>
                          ) : null;
                        })}
                      </ul>
                    </div>
                  ))}
                </section>
              )}
            </main>

            <aside className={styles.side}>
              <ConnectCta
                lede={`Two things the record can't tell you about ${city}: whether a given lender will write the loan, and what a building looks like from the inside. Both take a licensed professional.`}
                actions={[
                  { intent: "finance", label: "Finance a purchase" },
                  { intent: "foreign-national", label: "Foreign-national loan" },
                  { intent: "sell", label: "Sell my unit" },
                  { intent: "check-building", label: "Check a building" },
                ]}
              />

              <div className={styles.facts}>
                <div className={styles.factsHead}>{city} at a glance</div>
                <dl className={styles.factList}>
                  <Fact label="County" value={`${county.name} County`} />
                  <Fact
                    label="Population"
                    value={hub.population ? num(hub.population) : null}
                  />
                  <Fact label="Water" value={hub.coastal_water} />
                  <Fact label="Condo market" value={relevanceLabel(hub)} />
                </dl>
                {hub.wikipedia_ref && (
                  <a
                    className={styles.wiki}
                    href={hub.wikipedia_ref}
                    rel="nofollow noopener"
                  >
                    {city} on Wikipedia →
                  </a>
                )}
              </div>

              <nav className={styles.nearby} aria-label="Elsewhere">
                <div className={styles.nearbyHead}>Elsewhere</div>
                <ul>
                  <li>
                    <Link href={`/condos/${county.slug}`}>
                      All {county.name} County cities
                    </Link>
                  </li>
                  <li>
                    <Link href="/preconstruction">Preconstruction projects</Link>
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

/**
 * condo_relevance reads "HIGH — tower city; almost entirely condo". The split
 * requires whitespace around the dash so hyphenated words survive — an earlier
 * cut on bare [-—] turned "ultra-luxury" into "ultra — luxury".
 */
function relevanceParts(hub: CityHub): { level: string | null; detail: string | null } {
  const raw = hub.condo_relevance?.trim();
  if (!raw) return { level: null, detail: null };

  const [level, ...rest] = raw.split(/\s+[—–-]\s+/);
  const detail = rest.join(" — ").trim();
  return { level: level.trim(), detail: detail || null };
}

function relevanceLabel(hub: CityHub): string | null {
  const { level, detail } = relevanceParts(hub);
  if (!level) return null;
  return detail ? `${titleCase(level)} — ${detail}` : titleCase(level);
}

function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

/**
 * Weaves the workbook's identity fields into prose rather than dumping them.
 * Source capitalisation is left alone: these fields are as likely to start with
 * a proper noun ("Aventura Mall", "Venice of America") as a common one, and
 * lower-casing them blindly mangles the former.
 */
function intro(hub: CityHub, county: County): string[] {
  const city = hub.city ?? "This city";
  const nickname = stripPeriod(hub.identity_nickname?.trim() ?? "");
  const hooks = stripPeriod(hub.known_for_hooks?.trim() ?? "");
  const { detail } = relevanceParts(hub);

  const opener = nickname
    ? `${city} — ${nickname} — sits in ${county.name} County`
    : `${city} sits in ${county.name} County`;

  const paragraphs = [
    hub.population
      ? `${opener}, with a population of about ${num(hub.population)}.`
      : `${opener}.`,
  ];

  if (hooks) paragraphs.push(`It is known for ${hooks}.`);

  paragraphs.push(
    detail
      ? `For condo buyers and sellers, what matters is the stock: ${stripPeriod(
          detail
        )}. The counts below come straight from the public record for ${city}.`
      : `The counts below come straight from the public record for ${city}.`
  );

  return paragraphs;
}

function stripPeriod(value: string): string {
  return value.replace(/\.\s*$/, "");
}

function Stat({ n, l, tone }: { n: string; l: string; tone?: "go" }) {
  return (
    <div className={styles.stat}>
      <div className={`${styles.statN} ${tone === "go" ? styles.statGo : ""}`}>{n}</div>
      <div className={styles.statL}>{l}</div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <>
      <dt className={styles.factL}>{label}</dt>
      <dd className={styles.factV}>{value}</dd>
    </>
  );
}

function BuildingRow({
  building,
  risk,
}: {
  building: CityBuilding;
  risk?: boolean;
}) {
  const name = building.building_name ?? `Record #${building.id}`;
  const flags = building.signal_count ?? 0;

  return (
    <li>
      <Link href={`/building/${building.id}`}>{name}</Link>
      <span className={`${styles.linkMeta} mono`}>
        {building.address ?? "Address not on file"}
        {risk && flags > 0 ? ` · ${flags} flagged` : ""}
      </span>
      {risk && (
        <Link className={styles.riskLink} href={`/building/${building.id}/risk`}>
          Due-diligence read →
        </Link>
      )}
    </li>
  );
}
