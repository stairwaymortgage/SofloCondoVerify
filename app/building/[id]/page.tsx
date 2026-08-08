import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { supabase } from "@/lib/supabase";
import { buildSignals, recordId, type Signal } from "@/lib/signals";
import type { Building } from "@/lib/database.types";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

async function getBuilding(rawId: string): Promise<Building | null> {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) return null;

  const { data, error } = await supabase
    .from("buildings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[building/[id]]", error.message);
    return null;
  }
  return data as Building | null;
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
  const location = [building.city, building.county ? `${building.county} COUNTY` : null, building.zip]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <Masthead />

      <section className={styles.page}>
        <div className="wrap">
          <div className={`${styles.crumb} mono`}>
            <Link href="/">Home</Link> / Condo verification lookup /{" "}
            {building.building_name ?? "Record"}
          </div>

          <div className={styles.grid}>
            <main>
              <article className={styles.record}>
                <header className={styles.recHead}>
                  <div className={`${styles.doc} mono`}>Condo Verification Record</div>
                  <h1>{building.building_name ?? "Unnamed building"}</h1>
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

                <table className={styles.sig}>
                  <caption className={styles.caption}>
                    Seven independent public sources, read for this building.
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Signal</th>
                      <th scope="col">Status</th>
                      <th scope="col">As of</th>
                    </tr>
                  </thead>
                  <tbody>
                    {signals.map((signal) => (
                      <SignalRow key={signal.name} signal={signal} />
                    ))}
                  </tbody>
                </table>

                {building.signals && (
                  <div className={styles.rollup}>
                    <span className={styles.rollupLabel}>
                      Signals flagged for review
                      {building.signal_count ? ` (${building.signal_count})` : ""}
                    </span>
                    <span className={`${styles.rollupVal} mono`}>{building.signals}</span>
                  </div>
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

              <div className={styles.legend}>
                <div className={styles.legendHead}>How to read a status</div>
                <ul>
                  <LegendItem tone="go" label="Approved / cleared in the record" />
                  <LegendItem tone="flag" label="Rejected or revoked" />
                  <LegendItem tone="caution" label="Unconfirmed — worth checking" />
                  <LegendItem tone="none" label="Nothing on file / informational" />
                </ul>
              </div>
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

function SignalRow({ signal }: { signal: Signal }) {
  return (
    <tr>
      <th scope="row" className={styles.snm}>
        {signal.name}
        <span className={`${styles.srcx} mono`}>{signal.source}</span>
      </th>
      <td>
        <span className={`${styles.status} ${styles[`s_${signal.tone}`]}`}>
          <span className={styles.sq} aria-hidden /> {signal.value}
        </span>
      </td>
      <td className={`${styles.asof} mono`}>{signal.asOf}</td>
    </tr>
  );
}

function LegendItem({ tone, label }: { tone: string; label: string }) {
  return (
    <li>
      <span className={`${styles.legendSq} ${styles[`s_${tone}`]}`} aria-hidden />
      {label}
    </li>
  );
}
