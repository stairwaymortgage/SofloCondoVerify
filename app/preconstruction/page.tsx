import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import JsonLd from "@/components/JsonLd";
import SiteFooter from "@/components/SiteFooter";
import InquiryForm from "@/components/InquiryForm";
import { breadcrumbSchema } from "@/lib/schema";
import { num } from "@/lib/format";
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
  // Owns "South Florida preconstruction condos". The state qualifier is the
  // whole differentiator — no existing-inventory page may use it.
  title: "South Florida Preconstruction Condos",
  description:
    "Every preconstruction condo project we track in Miami-Dade and Broward: status, price from, delivery year and short-term rental rules.",
  alternates: { canonical: "/preconstruction" },
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

/**
 * An unwritten slot.
 *
 * Every one of these is copy that has to come from Jim (financing, NMLS
 * attributed) or Olga (real estate) and must not be drafted here. It renders
 * loud on purpose — amber, monospace, dashed — so a page that still has one
 * in it cannot be mistaken for a finished page at a glance.
 */
function Ph({ children }: { children: React.ReactNode }) {
  return <span className={`${styles.ph} mono`}>{children}</span>;
}

/** The three steps. Body lines are placeholders, the sequence is not. */
const STEPS = [
  {
    heading: "Free consultation",
    body: <Ph>[[OLGA: step 1 body — one line]]</Ph>,
  },
  {
    heading: "Your customized top 10 buildings",
    body: <Ph>[[OLGA: step 2 body — one line]]</Ph>,
  },
  {
    heading: "The tour",
    body: <Ph>[[OLGA: step 3 body — one line]]</Ph>,
  },
];

const TEAM = [
  {
    key: "jim",
    photoSlot: "[[JIM: photo]]",
    name: <Ph>[[JIM: display name]]</Ph>,
    role: <Ph>[[JIM: role line]]</Ph>,
    credential: <Ph>[[JIM: NMLS #]]</Ph>,
  },
  {
    key: "olga",
    photoSlot: "[[OLGA: photo]]",
    name: <Ph>[[OLGA: display name]]</Ph>,
    role: <Ph>[[OLGA: role line]]</Ph>,
    credential: <Ph>[[OLGA: license #]]</Ph>,
  },
];

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

          {/* ---- hero + process + CTA ----------------------------------
              One grid so the hero, the three steps and the form share a
              viewport on a desktop screen: the pitch and the way to respond
              to it should not be separated by a scroll. */}
          <div className={styles.intro}>
            <div className={styles.introMain}>
              <header className={styles.hero}>
                <div className={`${styles.doc} mono`}>
                  Preconstruction · buyer representation
                </div>
                {/* h2, not h1, and deliberately so: the page's one h1 is the
                    keyword-bearing index heading further down. This is sales
                    copy that may not carry the keyword at all. It is styled
                    larger than that h1 — visual hierarchy and heading
                    hierarchy answer to different things. */}
                <h2 className={styles.heroHead}>
                  <Ph>[[JIM: hero headline]]</Ph>
                </h2>
                <p className={styles.heroSub}>
                  <Ph>[[JIM: subhead]]</Ph>
                </p>
              </header>

              {/* Numbered sequence, not three cards: one connecting rule
                  runs behind the numerals and the steps share a row. */}
              <ol className={styles.steps} aria-label="How this works">
                {STEPS.map((step, index) => (
                  <li key={step.heading} className={styles.step}>
                    <span className={`${styles.stepN} mono`} aria-hidden>
                      {index + 1}
                    </span>
                    <span className={styles.stepHead}>{step.heading}</span>
                    <span className={styles.stepBody}>{step.body}</span>
                  </li>
                ))}
              </ol>

              {/* Step 3 continued: the buyer who cannot get on a plane. */}
              <div className={styles.remote}>
                <span className={`${styles.remoteKicker} mono`}>
                  Can&rsquo;t travel?
                </span>
                <span className={styles.remoteBody}>
                  <Ph>
                    [[OLGA: remote-buyer line — video tours by phone, photo and
                    video packages per building]]
                  </Ph>
                </span>
              </div>
            </div>

            <aside className={styles.introCta} aria-label="Request a consultation">
              <InquiryForm
                source="/preconstruction"
                intent="finance"
                heading="[[JIM: form heading]]"
                buttonLabel="[[JIM: button label]]"
                disclosure="[[COMPLIANCE: disclosure text — reviewed wording, do not draft]]"
              />
            </aside>
          </div>

          {/* ---- team ---- */}
          <section className={styles.team} aria-label="Who you will be working with">
            {TEAM.map((person) => (
              <div key={person.key} className={styles.member}>
                {/* Neutral frame, not a portrait: a stand-in face is worse
                    than an obviously empty slot. */}
                <div className={styles.photo} aria-hidden>
                  <span className={`${styles.photoNote} mono`}>
                    {person.photoSlot}
                  </span>
                </div>
                <div className={styles.memberBody}>
                  <div className={styles.memberName}>{person.name}</div>
                  <div className={styles.memberRole}>{person.role}</div>
                  <div className={styles.memberCred}>{person.credential}</div>
                </div>
              </div>
            ))}
          </section>

          <header className={styles.head}>
            <div className={`${styles.doc} mono`}>Preconstruction index</div>
            {/* The page's only h1: it carries the primary keyword. */}
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
            <Stat n={num(projects.length)} l="Projects tracked" />
            {counties.map((county) => (
              <Stat
                key={county.county}
                n={num(county.projects)}
                l={`${county.county} projects`}
              />
            ))}
            <Stat n={num(strCount)} l="Short-term rental allowed" />
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
