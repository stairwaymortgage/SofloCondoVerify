import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import JsonLd from "@/components/JsonLd";
import SiteFooter from "@/components/SiteFooter";
import HeroCta from "@/components/HeroCta";
import InquiryForm from "@/components/InquiryForm";
import { INTERIM_DISCLOSURE, consentText } from "@/lib/disclosures";
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

/** The three steps. Body lines are Olga's words, transcribed. */
const STEPS = [
  {
    heading: "Free consultation",
    body: "We talk first — your budget, your criteria, and what matters to you in a building.",
  },
  {
    heading: "Your customized top 10 buildings",
    body: "We send you our top ten recommended buildings, chosen from that conversation.",
  },
  {
    heading: "The tour",
    body: "When you visit, we take you to see them.",
  },
];

/**
 * Real people, real contact details. The role lines are still unwritten and
 * stay placeholders — everything else here is given data and is not to be
 * padded out with titles, brokerage names or descriptive copy.
 *
 * `focus` is the object-position for the square crop: both sources are
 * white-background headshots, but the framing differs (Jim's is a tight
 * portrait, Olga's is a wide frame with the subject off-centre), so each
 * needs its own focal point rather than a shared centre crop.
 */
const TEAM = [
  {
    key: "jim",
    name: "Jim Blackburn",
    photo: "/jim-blackburn.jpeg",
    focus: "50% 18%",
    role: "South Florida lending specialist",
    // Matches the sponsors-table credential_line verbatim. The two must not
    // drift: the same person is presented editorially here and as a paid
    // placement elsewhere on the site, and a reader who spots two different
    // credentials for one name has no way to know which is current.
    credential: "NMLS #1072866 · Equal Housing Lender · Stairway Mortgage",
    phone: { label: "(954) 993-1625", href: "tel:+19549931625" },
    website: "https://jamesjblackburn.com/",
  },
  {
    key: "olga",
    name: "Olga Blackburn",
    photo: "/olga-blackburn.jpeg",
    focus: "56% 22%",
    role: "South Florida real estate specialist",
    // Sponsors-table value, verbatim. Note the SL prefix — the licence number
    // given without it was incomplete.
    credential: "FL Lic. SL3569153 · The Keyes Company",
    // The vanity spelling is given alongside the digits; it stays visible as
    // written, but the tappable target is the dialable number.
    phone: {
      label: "786-225-5654",
      href: "tel:+17862255654",
      alt: "(786-CALL-OLG)",
    },
    website: "https://www.olgablackburn.com/",
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
                  Find out which buildings are offering the best incentives.
                </h2>
                <p className={styles.heroSub}>
                  Which allow financing, which require cash, and which are built
                  for the crowd you actually want to be part of. We&rsquo;ll tell
                  you before you fly in.
                </p>
                <HeroCta
                  intent="preconstruction"
                  sourcePage="/preconstruction"
                  label="Get my top 10 buildings"
                  fine="Free consultation &middot; no account required &middot; no obligation"
                />
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
                {/* Olga's line, verbatim from "We'll" on. Her original opened
                    with "Can't travel yet?", which the kicker beside it
                    already says — the sentence starts after it. */}
                <span className={styles.remoteBody}>
                  We&rsquo;ll walk you through every building by video tour over
                  the phone, and send you as many photos and videos as you need.
                </span>
              </div>
            </div>

            <aside className={styles.introCta} aria-label="Request a consultation">
              <InquiryForm
                source="/preconstruction"
                intent="finance"
                heading="Get your top 10 buildings"
                buttonLabel="Start with a free consultation"
                /* INTERIM — pending Jim's final wording. lib/disclosures.ts */
                disclosure={INTERIM_DISCLOSURE}
                /* TCPA consent, verbatim and identical on all four pages. */
                consentText={consentText}
              />
            </aside>
          </div>

          {/* ---- team ---- */}
          <section className={styles.team} aria-label="Who you will be working with">
            {TEAM.map((person) => (
              <div key={person.key} className={styles.member}>
                {/* Served at 192px for a 96px square so it stays sharp on a
                    2x screen; the square crop is done in CSS, not in the
                    file, so the originals stay untouched. */}
                <Image
                  className={styles.photo}
                  src={person.photo}
                  alt={person.name}
                  width={192}
                  height={192}
                  style={{ objectPosition: person.focus }}
                />
                <div className={styles.memberBody}>
                  <div className={styles.memberName}>{person.name}</div>
                  <div className={styles.memberRole}>{person.role}</div>
                  <div className={styles.memberCred}>{person.credential}</div>
                  <div className={styles.memberContact}>
                    <a className={styles.memberLink} href={person.phone.href}>
                      {person.phone.label}
                    </a>
                    {person.phone.alt && (
                      <span className={`${styles.memberAlt} mono`}>
                        {person.phone.alt}
                      </span>
                    )}
                  </div>
                  <a
                    className={styles.memberLink}
                    href={person.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {person.website}
                  </a>
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
