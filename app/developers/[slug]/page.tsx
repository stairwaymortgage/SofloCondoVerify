import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import ConnectCta from "@/components/ConnectCta";
import JsonLd from "@/components/JsonLd";
import {
  companySlug,
  getCompaniesWithProjects,
  getCompanyBySlug,
  getTowersByCompany,
  headquartersCity,
  type PortfolioTower,
} from "@/lib/companies";
import {
  formatPrice,
  getPreconByCompany,
  preconHref,
  statusLabel,
  statusTone,
  strAllowsShortTerm,
  type PreconProject,
} from "@/lib/precon";
import { breadcrumbSchema, organizationSchema } from "@/lib/schema";
import { num } from "@/lib/format";
import type { Company } from "@/lib/database.types";
import styles from "./page.module.css";

export const revalidate = 3600;

/**
 * Companies with at least one linked project prebuild — those are the pages
 * projects link into. The other ~380 render on demand and cache for an hour.
 */
export async function generateStaticParams() {
  const companies = await getCompaniesWithProjects();
  return companies
    .map((company) => ({ slug: companySlug(company.url_slug) }))
    .filter((params): params is { slug: string } => Boolean(params.slug));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const company = await getCompanyBySlug(params.slug);
  if (!company?.company) return { title: "Company not found · SoFloCondoVerify" };

  return {
    title: `${company.company} — condo projects and buildings · SoFloCondoVerify`,
    description: `Every South Florida condo project and building in our file linked to ${
      company.company
    }${company.type ? `, ${company.type.toLowerCase()}` : ""} — with status, delivery and verification records for each.`,
  };
}

export default async function DeveloperPage({ params }: { params: { slug: string } }) {
  const company = await getCompanyBySlug(params.slug);
  if (!company?.company) notFound();

  const [precon, towers] = await Promise.all([
    getPreconByCompany(company.id),
    getTowersByCompany(company.id),
  ]);

  const total = precon.length + towers.length;
  const name = company.company;
  const segment = companySlug(company.url_slug) ?? params.slug;
  const path = `/developers/${segment}`;
  const city = headquartersCity(company.headquarters);
  const isDeveloper = /develop/i.test(company.type ?? "");

  return (
    <>
      <JsonLd
        schemas={[
          organizationSchema(name, path, company.headquarters),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Developers", path: "/developers" },
            { name, path },
          ]),
        ]}
      />
      <Masthead />

      <section className={styles.page}>
        <div className="wrap">
          <Breadcrumbs
            trail={[
              { name: "Home", href: "/" },
              { name: "Developers", href: "/developers" },
              { name },
            ]}
          />

          <div className={styles.grid}>
            <main className={styles.main}>
              <article className={styles.record}>
                <header className={styles.recHead}>
                  <div className={`${styles.doc} mono`}>Company record</div>
                  <h1>{name}</h1>
                  {company.type && (
                    <div className={styles.badges}>
                      <span className={styles.badge}>{company.type}</span>
                    </div>
                  )}
                  {company.headquarters && (
                    <div className={`${styles.hq} mono`}>{company.headquarters}</div>
                  )}
                  <div className={`${styles.rid} mono`}>
                    {total} project{total === 1 ? "" : "s"} in our file
                    {company.developments
                      ? ` · ${num(company.developments)} listed in the source workbook`
                      : ""}
                    {city ? ` · ${city}` : ""}
                  </div>
                </header>

                <div className={styles.intro}>
                  <p>
                    {total > 0 ? (
                      <>
                        Everything below is a project our file links to {name}. It
                        is what we hold, not a complete body of work — and each
                        entry carries only what the public record shows for it.
                      </>
                    ) : (
                      <>
                        We hold a record for {name}, but nothing in our file names
                        them on a project yet. That is a gap in our data rather
                        than a statement about the company.
                      </>
                    )}
                  </p>
                </div>
              </article>

              {/* ---- portfolio ---- */}
              {precon.length > 0 && (
                <section className={styles.block}>
                  <h2 className={styles.blockHead}>
                    Preconstruction
                    <span className={`${styles.blockN} mono`}>{precon.length}</span>
                  </h2>
                  <ul className={styles.cards}>
                    {precon.map((project) => (
                      <PreconCard key={project.slug} project={project} />
                    ))}
                  </ul>
                </section>
              )}

              {towers.length > 0 && (
                <section className={styles.block}>
                  <h2 className={styles.blockHead}>
                    Existing buildings
                    <span className={`${styles.blockN} mono`}>{towers.length}</span>
                  </h2>
                  <p className={styles.blockNote}>
                    Standing towers in our file. Where the name matches exactly one
                    building in the verification file, the card links to that
                    record; where it doesn&rsquo;t, we&rsquo;d rather show no link
                    than the wrong building.
                  </p>
                  <ul className={styles.cards}>
                    {towers.map((tower) => (
                      <TowerCard key={tower.id} tower={tower} />
                    ))}
                  </ul>
                </section>
              )}

              {/* ---- portfolio-wide financing ---- */}
              {isDeveloper && total > 1 && (
                <section className={styles.finance}>
                  <div className={`${styles.financeKicker} mono`}>
                    Financing across the portfolio
                  </div>
                  <h2>Financing across {name}&rsquo;s projects</h2>
                  <p>
                    Financing is decided building by building, not developer by
                    developer: agency approval, reserves and rental rules sit with
                    each association, so two projects from the same developer can
                    take very different loans. If you&rsquo;re weighing more than
                    one of these — or comparing a preconstruction contract against
                    a standing building — a licensed loan officer can price the
                    routes side by side before you commit to any of them.
                  </p>
                  <Link className={styles.financeBtn} href="/connect?intent=finance">
                    Compare financing on these projects
                  </Link>
                  <div className={styles.financeFine}>
                    Free · no account required · not a loan offer or commitment to
                    lend
                  </div>
                </section>
              )}

              <nav className={styles.related} aria-label="Related">
                <div className={styles.relatedHead}>Related</div>
                <ul>
                  <li>
                    <Link href="/developers">All developers and design firms</Link>
                  </li>
                  <li>
                    <Link href="/preconstruction">
                      All South Florida preconstruction
                    </Link>
                  </li>
                  <li>
                    <Link href="/">Look up a specific building</Link>
                  </li>
                </ul>
              </nav>
            </main>

            <aside className={styles.side}>
              <ConnectCta
                lede={`We're an independent record, not ${name} or their sales office. Tell us what you need and we'll match you with a licensed professional who can answer it.`}
                actions={[
                  { intent: "finance", label: "Finance a purchase" },
                  { intent: "foreign-national", label: "Foreign-national loan" },
                  { intent: "check-building", label: "Ask about a building" },
                  { intent: "sell", label: "Sell my unit" },
                ]}
              />

              <div className={styles.note}>
                <div className={styles.noteHead}>About this page</div>
                <p>
                  Compiled from public and developer sources. Listing a company
                  here is not an endorsement, an affiliation, or a statement about
                  its work — and nothing on this page is legal or financial advice.
                </p>
              </div>
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

function PreconCard({ project }: { project: PreconProject }) {
  const price = formatPrice(project.priceFrom);

  return (
    <li className={styles.card}>
      <Link href={preconHref(project)} className={styles.cardLink}>
        <span className={styles.cardName}>{project.project}</span>
        <span className={`${styles.cardWhere} mono`}>
          {[project.area, project.county].filter(Boolean).join(" · ")}
        </span>
        <span className={styles.chips}>
          <span className={`${styles.chip} ${styles[`t_${statusTone(project.status)}`]}`}>
            {statusLabel(project.status)}
          </span>
          {strAllowsShortTerm(project) && (
            <span className={`${styles.chip} ${styles.chipStr}`}>
              Short-term rental OK
            </span>
          )}
        </span>
        <span className={styles.facts}>
          <span className={styles.fact}>
            <span className={styles.factL}>From</span>
            <span className={`${styles.factV} mono`}>{price ?? "Not published"}</span>
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

function TowerCard({ tower }: { tower: PortfolioTower }) {
  const body = (
    <>
      <span className={styles.cardName}>{tower.building}</span>
      <span className={`${styles.cardWhere} mono`}>
        {tower.neighborhood ?? "Neighborhood not on file"}
      </span>
      <span className={styles.facts}>
        {tower.yearBuilt && (
          <span className={styles.fact}>
            <span className={styles.factL}>Built</span>
            <span className={`${styles.factV} mono`}>{tower.yearBuilt}</span>
          </span>
        )}
        {tower.units && (
          <span className={styles.fact}>
            <span className={styles.factL}>Units</span>
            <span className={`${styles.factV} mono`}>{num(tower.units)}</span>
          </span>
        )}
        {tower.floors && (
          <span className={styles.fact}>
            <span className={styles.factL}>Floors</span>
            <span className={`${styles.factV} mono`}>{tower.floors}</span>
          </span>
        )}
      </span>
    </>
  );

  return (
    <li className={styles.card}>
      {tower.buildingId ? (
        <Link href={`/building/${tower.buildingId}`} className={styles.cardLink}>
          {body}
          <span className={styles.cardCta}>Verification record →</span>
        </Link>
      ) : (
        <div className={`${styles.cardLink} ${styles.cardStatic}`}>{body}</div>
      )}
    </li>
  );
}
