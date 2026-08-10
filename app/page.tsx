import Masthead from "@/components/Masthead";
import LookupForm from "@/components/LookupForm";
import SiteFooter from "@/components/SiteFooter";
import { getTriCountyBuildingCount } from "@/lib/counts";
import { num } from "@/lib/format";
import styles from "./page.module.css";

/** Re-check the building count hourly rather than on every request. */
export const revalidate = 3600;

export default async function Home() {
  const buildingCount = await getTriCountyBuildingCount();
  const buildingCountLabel = num(buildingCount);

  return (
    <>
      <Masthead />

      {/* HERO */}
      <section className={styles.hero}>
        <div className="wrap">
          <div className={`${styles.crumb} mono`}>
            Home / Condo verification lookup
          </div>
          <div className={styles.herogrid}>
            <div>
              <h1 className={styles.head}>
                Look up any South Florida condo. See if it{" "}
                <span className={styles.mark}>clears</span>.
              </h1>
              <p className={styles.lede}>
                A public-records verification for every building in Miami-Dade,
                Broward, and Palm Beach — FHA and VA standing, reserve and
                structural signals, and whether financing is realistic. Compiled
                from official sources.
              </p>
              <ul className={styles.assurances}>
                <li>
                  <Check /> Free to search — no account, no signup required.
                </li>
                <li>
                  <Check /> Every figure carries an as-of date and links to its
                  government source.
                </li>
                <li>
                  <Check /> Signals are leads for a conversation — never verdicts
                  on a building.
                </li>
              </ul>
            </div>
            <LookupForm buildingCountLabel={buildingCountLabel} />
          </div>
        </div>
      </section>

      {/* STAT BAR */}
      <section className={styles.statbar}>
        <div className={`wrap ${styles.statgrid}`}>
          <Stat n={buildingCountLabel} l="Buildings on file" />
          <Stat n="7×" l="Public sources per building" />
          <Stat n="164" l="Preconstruction projects" />
          <Stat n="639" l="Buildings flagged to review" />
        </div>
      </section>

      {/* SAMPLE RECORD */}
      <section className={styles.recsec}>
        <div className="wrap">
          <div className={styles.kicker}>Sample verification record</div>
          <h2 className={styles.rectitle}>
            One building, read across seven independent public sources
          </h2>
          <div className={styles.record}>
            <div className={styles.recHead}>
              <div className={`${styles.doc} mono`}>Condo Verification Record</div>
              <h3>Oceanview Terraces Condominium</h3>
              <div className={`${styles.addr} mono`}>
                1450 OCEAN DR · SUNNY ISLES BEACH · FL 33160
              </div>
              <div className={`${styles.rid} mono`}>
                RECORD <b>#SIB-33160-1450</b> · Pulled 2026-07-24
              </div>
            </div>
            <table className={styles.sig}>
              <thead>
                <tr>
                  <th>Signal</th>
                  <th>Status</th>
                  <th>As of</th>
                </tr>
              </thead>
              <tbody>
                <Row name="FHA approval" src="HUD condolook" s="ok" v="Approved (HRAP)" as="exp 2027-04-11" />
                <Row name="VA approval" src="VA condo report" s="no" v="Rejected" as="2025-09" />
                <Row name="Conventional (Fannie/Freddie)" src="not publishable — checked privately" s="ca" v="Check with us" as="—" />
                <Row name="Milestone (SB4D)" src="FL DBPR" s="ok" v="In program" as="3+ stories" />
                <Row name="Reserve study (SIRS)" src="FL DBPR filing" s="ca" v="Unconfirmed — none on file" as="—" />
                <Row name="Association registry" src="county / state — ordinance only" s="ok" v="In good standing" as="2026-06" />
                <Row name="Recertification (40-yr)" src="county portal" s="ok" v="Not yet due" as="due 2031" />
              </tbody>
            </table>
          </div>
          <p className={`${styles.recfoot} mono`}>
            Every status links to its official source · Framing follows
            public-record limits (e.g. “unconfirmed,” not “non-compliant”)
          </p>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}

function Check() {
  return (
    <span className={styles.ck} aria-hidden>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M5 12l5 5L20 6" />
      </svg>
    </span>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className={styles.st}>
      <div className={styles.stn}>{n}</div>
      <div className={styles.stl}>{l}</div>
    </div>
  );
}

function Row({
  name,
  src,
  s,
  v,
  as,
}: {
  name: string;
  src: string;
  s: "ok" | "no" | "ca";
  v: string;
  as: string;
}) {
  return (
    <tr>
      <td className={styles.snm}>
        {name}
        <span className={`${styles.srcx} mono`}>{src}</span>
      </td>
      <td>
        <span className={`${styles.status} ${styles["s_" + s]}`}>
          <span className={styles.sq} /> {v}
        </span>
      </td>
      <td className={`${styles.asof} mono`}>{as}</td>
    </tr>
  );
}
