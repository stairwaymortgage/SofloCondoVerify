import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import {
  formatPrice,
  getPreconProjects,
  preconHref,
  statusLabel,
  statusTone,
  strAllowsShortTerm,
  type PreconProject,
} from "@/lib/precon";
import styles from "./page.module.css";

/** Precon inventory changes on a monthly-ish cadence, not per request. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Preconstruction condos in South Florida · SoFloCondoVerify",
  description:
    "Every preconstruction condo project we track in Miami-Dade and Broward — status, price from, delivery year, and whether short-term rentals are allowed. Foreign-national financing options explained.",
};

interface AreaGroup {
  area: string;
  projects: PreconProject[];
}

interface CountyGroup {
  county: string;
  projects: number;
  areas: AreaGroup[];
}

/** County → area, areas ordered by project count then name. */
function group(projects: PreconProject[]): CountyGroup[] {
  const counties = new Map<string, Map<string, PreconProject[]>>();

  for (const project of projects) {
    const areas = counties.get(project.county) ?? new Map();
    counties.set(project.county, areas);
    areas.set(project.area, [...(areas.get(project.area) ?? []), project]);
  }

  return ["Miami-Dade", "Broward"]
    .filter((county) => counties.has(county))
    .map((county) => {
      const areas = counties.get(county)!;
      return {
        county,
        projects: [...areas.values()].reduce((n, list) => n + list.length, 0),
        areas: [...areas.entries()]
          .map(([area, list]) => ({ area, projects: list }))
          .sort(
            (a, b) =>
              b.projects.length - a.projects.length ||
              a.area.localeCompare(b.area, "en")
          ),
      };
    });
}

function areaAnchor(county: string, area: string): string {
  return `${county}-${area}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default async function PreconstructionIndex() {
  const projects = await getPreconProjects();
  const counties = group(projects);
  const strCount = projects.filter(strAllowsShortTerm).length;

  return (
    <>
      <JsonLd
        schemas={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Preconstruction", path: "/preconstruction" },
          ]),
        ]}
      />
      <Masthead />

      <section className={styles.page}>
        <div className="wrap">
          <div className={`${styles.crumb} mono`}>
            <Link href="/">Home</Link> / Preconstruction
          </div>

          <header className={styles.head}>
            <div className={`${styles.doc} mono`}>Preconstruction index</div>
            <h1>Preconstruction condos in South Florida</h1>
            <p className={styles.lede}>
              Every project we track in Miami-Dade and Broward, grouped by
              neighborhood and city. Status, pricing, delivery and short-term
              rental posture come from the developer record as published — a
              project&rsquo;s standing with any lender is a separate question, and
              one we can help you get answered.
            </p>
          </header>

          <div className={styles.stats}>
            <Stat n={projects.length.toLocaleString()} l="Projects tracked" />
            {counties.map((county) => (
              <Stat
                key={county.county}
                n={county.projects.toLocaleString()}
                l={`${county.county} projects`}
              />
            ))}
            <Stat n={strCount.toLocaleString()} l="Short-term rental allowed" />
          </div>

          {/* Foreign-national financing — the reason most overseas buyers
              rule preconstruction out before they need to. */}
          <aside className={styles.hook}>
            <div className={styles.hookBody}>
              <div className={`${styles.hookKicker} mono`}>
                Foreign-national financing
              </div>
              <h2>Buying from overseas? You may not need to pay all cash.</h2>
              <p>
                Many overseas buyers assume a US preconstruction purchase means
                cash on the barrel. Non-resident foreign-national loan programs
                exist for exactly this buyer: qualified purchasers can finance the
                bulk of the price through a US lender, without US credit history,
                and cover the rest as a down payment. Terms vary by lender,
                program and project.
              </p>
              <Link
                className={styles.hookBtn}
                href="/connect?intent=foreign-national"
              >
                Ask about foreign-national financing
              </Link>
              <p className={styles.hookFine}>
                Free · no account required · not a loan offer or commitment to
                lend
              </p>
            </div>
          </aside>

          <nav className={styles.jump} aria-label="Jump to an area">
            {counties.map((county) =>
              county.areas.map((areaGroup) => (
                <a
                  key={areaAnchor(county.county, areaGroup.area)}
                  href={`#${areaAnchor(county.county, areaGroup.area)}`}
                  className={styles.jumpLink}
                >
                  {areaGroup.area}
                  <span className={`${styles.jumpN} mono`}>
                    {areaGroup.projects.length}
                  </span>
                </a>
              ))
            )}
          </nav>

          {counties.map((county) => (
            <section key={county.county} className={styles.county}>
              <h2 className={styles.countyHead}>
                {county.county}
                <span className={`${styles.countyN} mono`}>
                  {county.projects} project{county.projects === 1 ? "" : "s"}
                </span>
              </h2>

              {county.areas.map((areaGroup) => (
                <div
                  key={areaGroup.area}
                  id={areaAnchor(county.county, areaGroup.area)}
                  className={styles.area}
                >
                  <h3 className={styles.areaHead}>
                    {areaGroup.area}
                    <span className={`${styles.areaN} mono`}>
                      {areaGroup.projects.length}
                    </span>
                  </h3>
                  <ul className={styles.cards}>
                    {areaGroup.projects.map((project) => (
                      <ProjectCard key={project.slug} project={project} />
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ))}

          <p className={styles.foot}>
            Project details are compiled from developer and public sources and
            change as a project moves through construction. Nothing here is legal
            or financial advice, an offer to sell, or a solicitation to buy.
          </p>
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

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className={styles.stat}>
      <div className={styles.statN}>{n}</div>
      <div className={styles.statL}>{l}</div>
    </div>
  );
}

function ProjectCard({ project }: { project: PreconProject }) {
  const price = formatPrice(project.priceFrom);
  const where = [project.area, project.areaDetail].filter(Boolean).join(" · ");

  return (
    <li className={styles.card}>
      <Link href={preconHref(project)} className={styles.cardLink}>
        <span className={styles.cardName}>{project.project}</span>
        <span className={`${styles.cardWhere} mono`}>{where}</span>

        <span className={styles.chips}>
          <span
            className={`${styles.chip} ${styles[`t_${statusTone(project.status)}`]}`}
          >
            {statusLabel(project.status)}
          </span>
          {project.soldOut && (
            <span className={`${styles.chip} ${styles.t_none}`}>Sold out</span>
          )}
          {strAllowsShortTerm(project) && (
            <span className={`${styles.chip} ${styles.chipStr}`}>
              Short-term rental OK
            </span>
          )}
        </span>

        <span className={styles.facts}>
          <span className={styles.fact}>
            <span className={styles.factL}>From</span>
            <span className={`${styles.factV} mono`}>
              {price ?? "Not published"}
            </span>
          </span>
          <span className={styles.fact}>
            <span className={styles.factL}>Delivery</span>
            <span className={`${styles.factV} mono`}>
              {project.deliveryYear ?? project.delivery ?? "—"}
            </span>
          </span>
        </span>
      </Link>
    </li>
  );
}
