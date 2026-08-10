import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import ConnectCta from "@/components/ConnectCta";
import {
  companyHref,
  getCompanies,
  getLinkedCounts,
  headquartersCity,
  type LinkedCounts,
} from "@/lib/companies";
import { breadcrumbSchema } from "@/lib/schema";
import { num } from "@/lib/format";
import type { Company } from "@/lib/database.types";
import styles from "./page.module.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Condo developers, architects and design firms · SoFloCondoVerify",
  description:
    "Every developer, architecture, interior and landscape firm behind the South Florida condo projects we track — with the buildings and preconstruction projects linked to each.",
};

/** Sections in the order a reader cares about them. */
const TYPE_ORDER = [
  "Development Company",
  "Development Partner",
  "Architecture Firm",
  "Interior Design Firm",
  "Landscape Design Firm",
  "Brand Partner",
  "Hospitality Operator",
  "Project Management",
];

function typeRank(type: string): number {
  const index = TYPE_ORDER.indexOf(type);
  return index === -1 ? TYPE_ORDER.length : index;
}

interface Entry {
  company: Company;
  href: string;
  counts: LinkedCounts;
}

interface TypeGroup {
  type: string;
  linked: Entry[];
  rest: Entry[];
}

function group(companies: Company[], counts: Map<number, LinkedCounts>): TypeGroup[] {
  const groups = new Map<string, Entry[]>();

  for (const company of companies) {
    const href = companyHref(company);
    if (!href || !company.company) continue;

    const type = company.type?.trim() || "Other";
    const entry: Entry = {
      company,
      href,
      counts: counts.get(company.id) ?? { precon: 0, existing: 0, total: 0 },
    };
    groups.set(type, [...(groups.get(type) ?? []), entry]);
  }

  return [...groups.entries()]
    .map(([type, entries]) => ({
      type,
      linked: entries
        .filter((entry) => entry.counts.total > 0)
        .sort(
          (a, b) =>
            b.counts.total - a.counts.total ||
            (a.company.company ?? "").localeCompare(b.company.company ?? "", "en")
        ),
      rest: entries
        .filter((entry) => entry.counts.total === 0)
        .sort((a, b) =>
          (a.company.company ?? "").localeCompare(b.company.company ?? "", "en")
        ),
    }))
    .sort((a, b) => typeRank(a.type) - typeRank(b.type));
}

function anchor(type: string): string {
  return type.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default async function DevelopersIndex() {
  const [companies, counts] = await Promise.all([getCompanies(), getLinkedCounts()]);
  const groups = group(companies, counts);
  const withProjects = [...counts.values()].length;

  return (
    <>
      <JsonLd
        schemas={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Developers", path: "/developers" },
          ]),
        ]}
      />
      <Masthead />

      <section className={styles.page}>
        <div className="wrap">
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "Developers" }]} />

          <header className={styles.head}>
            <div className={`${styles.doc} mono`}>Company index</div>
            <h1>Who builds and designs South Florida condos</h1>
            <p className={styles.lede}>
              The developers, architects and design firms behind the projects in
              our file. Each page collects that company&rsquo;s buildings and
              preconstruction projects in one place, so you can see the rest of a
              portfolio before you commit to any part of it.
            </p>
          </header>

          <div className={styles.stats}>
            <Stat n={num(companies.length)} l="Companies tracked" />
            <Stat n={num(withProjects)} l="With linked projects" />
            <Stat n={num(groups.length)} l="Company types" />
          </div>
          <p className={styles.statsNote}>
            Project counts below are what we hold in our own tables — not a
            company&rsquo;s full body of work. A company with no linked projects
            still has a page; it simply means nothing in our file names them yet.
          </p>

          <nav className={styles.jump} aria-label="Jump to a company type">
            {groups.map((typeGroup) => (
              <a
                key={typeGroup.type}
                href={`#${anchor(typeGroup.type)}`}
                className={styles.jumpLink}
              >
                {typeGroup.type}
                <span className={`${styles.jumpN} mono`}>
                  {typeGroup.linked.length + typeGroup.rest.length}
                </span>
              </a>
            ))}
          </nav>

          <div className={styles.grid}>
            <main className={styles.main}>
              {groups.map((typeGroup) => (
                <section
                  key={typeGroup.type}
                  id={anchor(typeGroup.type)}
                  className={styles.typeBlock}
                >
                  <h2 className={styles.typeHead}>
                    {typeGroup.type}
                    <span className={`${styles.typeN} mono`}>
                      {typeGroup.linked.length + typeGroup.rest.length}
                    </span>
                  </h2>

                  {typeGroup.linked.length > 0 && (
                    <ul className={styles.cards}>
                      {typeGroup.linked.map((entry) => (
                        <CompanyCard key={entry.company.id} entry={entry} />
                      ))}
                    </ul>
                  )}

                  {typeGroup.rest.length > 0 && (
                    <div className={styles.rest}>
                      <div className={styles.restHead}>
                        Also tracked — no linked projects in our file yet
                      </div>
                      <ul className={styles.restList}>
                        {typeGroup.rest.map((entry) => (
                          <li key={entry.company.id}>
                            <Link href={entry.href}>{entry.company.company}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              ))}
            </main>

            <aside className={styles.side}>
              <ConnectCta
                lede="Looking at a project from one of these developers? A licensed professional can tell you what a lender will actually do with it — and what the rest of the portfolio looks like from the inside."
                actions={[
                  { intent: "finance", label: "Finance a purchase" },
                  { intent: "foreign-national", label: "Foreign-national loan" },
                  { intent: "check-building", label: "Ask about a building" },
                ]}
              />

              <nav className={styles.nearby} aria-label="Elsewhere">
                <div className={styles.nearbyHead}>Elsewhere</div>
                <ul>
                  <li>
                    <Link href="/preconstruction">Preconstruction projects</Link>
                  </li>
                  <li>
                    <Link href="/condos/miami-dade">Miami-Dade cities</Link>
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

function CompanyCard({ entry }: { entry: Entry }) {
  const city = headquartersCity(entry.company.headquarters);
  const { precon, existing, total } = entry.counts;

  return (
    <li className={styles.card}>
      <Link href={entry.href} className={styles.cardLink}>
        <span className={styles.cardName}>{entry.company.company}</span>
        <span className={`${styles.cardMeta} mono`}>
          {[entry.company.type, city].filter(Boolean).join(" · ")}
        </span>
        <span className={styles.cardCounts}>
          <span className={styles.cardTotal}>
            {total} project{total === 1 ? "" : "s"} linked
          </span>
          <span className={`${styles.cardSplit} mono`}>
            {[
              precon ? `${precon} precon` : null,
              existing ? `${existing} existing` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </span>
      </Link>
    </li>
  );
}
