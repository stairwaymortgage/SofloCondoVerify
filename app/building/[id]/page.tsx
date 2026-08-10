import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import SignalTable, { SignalLegend } from "@/components/SignalTable";
import JsonLd from "@/components/JsonLd";
import { getBuilding, getPriorityBuildingIds } from "@/lib/buildings";
import { buildSignals, hasStackedFlags, recordId } from "@/lib/signals";
import { cityHubHref, countyByDb, getCityHubForBuilding } from "@/lib/cities";
import { breadcrumbSchema, buildingSchema } from "@/lib/schema";
import styles from "./page.module.css";

/**
 * ISR: the priority set is prebuilt (see generateStaticParams) and the rest of
 * the tri-county file renders on first request, then caches for an hour.
 */
export const revalidate = 3600;

/**
 * ~8,700 tri-county buildings is more than is worth prebuilding, so only the
 * priority set ships in the build. Everything else is generated on demand.
 */
export async function generateStaticParams() {
  const ids = await getPriorityBuildingIds();
  return ids.map((id) => ({ id: String(id) }));
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const building = await getBuilding(params.id);
  if (!building) return { title: "Record not found · SoFloCondoVerify" };

  const where = [building.city, "FL", building.zip].filter(Boolean).join(" ");
  return {
    title: `${building.building_name ?? "Condo record"} — ${where} · SoFloCondoVerify`,
    description: `Public-record verification for ${
      building.building_name ?? "this building"
    }: FHA and VA standing, milestone and reserve signals, registry and recertification.`,
  };
}

export default async function BuildingPage({ params }: { params: { id: string } }) {
  const building = await getBuilding(params.id);
  if (!building) notFound();

  const signals = buildSignals(building);
  const pulled = new Date(building.created_at).toISOString().slice(0, 10);
  const name = building.building_name ?? "Unnamed building";
  const location = [building.city, building.county ? `${building.county} COUNTY` : null, building.zip]
    .filter(Boolean)
    .join(" · ");

  // Home > County > City > Building, wherever the record has a city hub.
  const hub = await getCityHubForBuilding(building);
  const county = countyByDb(building.county);
  const hubHref = hub ? cityHubHref(hub) : null;

  const trail = [
    { name: "Home", path: "/" },
    ...(county ? [{ name: `${county.name} County`, path: `/condos/${county.slug}` }] : []),
    ...(hub?.city && hubHref ? [{ name: hub.city, path: hubHref }] : []),
    { name, path: `/building/${building.id}` },
  ];

  return (
    <>
      <JsonLd schemas={[buildingSchema(building), breadcrumbSchema(trail)]} />
      <Masthead />

      <section className={styles.page}>
        <div className="wrap">
          <Breadcrumbs
            trail={trail.map((crumb, index) => ({
              name: crumb.name,
              href: index < trail.length - 1 ? crumb.path : undefined,
            }))}
          />

          <div className={styles.grid}>
            <main>
              <article className={styles.record}>
                <header className={styles.recHead}>
                  <div className={`${styles.doc} mono`}>Condo Verification Record</div>
                  <h1>{name}</h1>
                  <div className={`${styles.addr} mono`}>
                    {building.address ?? "Address not on file"}
                    {location ? ` · ${location}` : ""}
                  </div>
                  <div className={`${styles.rid} mono`}>
                    RECORD <b>#{recordId(building)}</b> · Pulled {pulled}
                    {building.tri_county === "Yes" ? " · Tri-county" : ""}
                  </div>
                  {building.precon && (
                    <div className={styles.precon}>
                      Preconstruction project
                      {building.precon_status ? ` · ${building.precon_status}` : ""}
                    </div>
                  )}
                </header>

                <SignalTable
                  signals={signals}
                  caption="Seven independent public sources, read for this building."
                />

                {building.signals && (
                  <div className={styles.rollup}>
                    <span className={styles.rollupLabel}>
                      Signals flagged for review
                      {building.signal_count ? ` (${building.signal_count})` : ""}
                    </span>
                    <span className={`${styles.rollupVal} mono`}>{building.signals}</span>
                  </div>
                )}

                {hasStackedFlags(building) && (
                  <Link
                    className={styles.riskLink}
                    href={`/building/${building.id}/risk`}
                  >
                    <span className={styles.riskLinkHead}>
                      See the due-diligence read →
                    </span>
                    <span className={styles.riskLinkBody}>
                      The same record ordered by what to look into first, with what
                      it means for financing, for selling, and for a cash purchase.
                    </span>
                  </Link>
                )}

                <footer className={styles.recFoot}>
                  <p>
                    Every status above reflects what is present in the public record on
                    the date pulled. A missing filing is recorded as{" "}
                    <b>unconfirmed</b> — it is not evidence that a building is out of
                    compliance. Conventional (Fannie/Freddie) standing is not
                    publishable; check with a licensed pro.
                  </p>
                  <p className="mono">
                    Not legal or financial advice · Not affiliated with any government
                    agency
                  </p>
                </footer>
              </article>
            </main>

            <aside className={styles.side}>
              <div className={styles.cta}>
                <div className={styles.ctaHead}>Get connected — free</div>
                <div className={styles.ctaBody}>
                  <p className={styles.ctaLede}>
                    Signals are leads for a conversation, not verdicts. Get matched with
                    a licensed professional who can check what the public record can’t
                    show.
                  </p>
                  <div className={styles.ctaBtns}>
                    <Link
                      className={styles.btnPrimary}
                      href={`/connect?intent=finance&record=${building.id}`}
                    >
                      Finance a purchase
                    </Link>
                    <Link
                      className={styles.btnSecondary}
                      href={`/connect?intent=foreign-national&record=${building.id}`}
                    >
                      Foreign-national loan
                    </Link>
                    <Link
                      className={styles.btnSecondary}
                      href={`/connect?intent=sell&record=${building.id}`}
                    >
                      Sell my unit
                    </Link>
                    <Link
                      className={styles.btnSecondary}
                      href={`/connect?intent=check-building&record=${building.id}`}
                    >
                      Ask about this building
                    </Link>
                  </div>
                  <p className={styles.ctaFine}>
                    Free · no account required · no obligation
                  </p>
                </div>
              </div>

              <SignalLegend />

              {hubHref && hub?.city && (
                <div className={styles.hubCard}>
                  <div className={styles.hubHead}>In this city</div>
                  <Link href={hubHref}>
                    {hub.city} condo verification data →
                  </Link>
                  <p>
                    Current counts for {hub.city}, the buildings worth a closer
                    look, and answers to what buyers and sellers ask here.
                  </p>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      <footer className={styles.pageFoot}>
        <div className="wrap">
          <div>© 2026 SoFloCondoVerify.com · Miami-Dade · Broward · Palm Beach</div>
          <div>
            Independent record · Ads are labeled “Advertisement” · Not legal or financial
            advice
          </div>
        </div>
      </footer>
    </>
  );
}
