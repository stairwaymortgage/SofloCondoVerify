import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import {
  developerHref,
  financingIllustration,
  formatPrice,
  getPreconBySlug,
  getRelatedPrecon,
  preconHref,
  preconRecordId,
  statusLabel,
  statusTone,
  strAllowsShortTerm,
  strFact,
} from "@/lib/precon";
import styles from "./page.module.css";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const project = await getPreconBySlug(params.slug);
  if (!project) return { title: "Project not found · SoFloCondoVerify" };

  const where = [project.area, project.county].filter(Boolean).join(", ");
  const price = formatPrice(project.priceFrom);

  return {
    title: `${project.project} — preconstruction in ${where} · SoFloCondoVerify`,
    description: [
      `${project.project} is a preconstruction condo project in ${where}.`,
      project.status ? `Status: ${statusLabel(project.status)}.` : null,
      price ? `Priced from ${price}.` : null,
      project.deliveryYear ? `Delivery ${project.deliveryYear}.` : null,
      "Foreign-national financing options for non-resident buyers.",
    ]
      .filter(Boolean)
      .join(" "),
  };
}

export default async function PreconProjectPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = await getPreconBySlug(params.slug);
  if (!project) notFound();

  const related = await getRelatedPrecon(project);
  const price = formatPrice(project.priceFrom);
  const illustration = financingIllustration(project.priceFrom);
  const devHref = developerHref(project.developerSlug);
  const str = strFact(project);
  const connect = (intent: string) =>
    `/connect?intent=${intent}&record=${encodeURIComponent(project.slug)}`;

  const where = [project.area, project.areaDetail].filter(Boolean).join(" · ");

  return (
    <>
      <Masthead />

      <section className={styles.page}>
        <div className="wrap">
          <div className={`${styles.crumb} mono`}>
            <Link href="/">Home</Link> /{" "}
            <Link href="/preconstruction">Preconstruction</Link> / {project.project}
          </div>

          <div className={styles.grid}>
            <main className={styles.main}>
              <article className={styles.record}>
                <header className={styles.recHead}>
                  <div className={`${styles.doc} mono`}>
                    Preconstruction project record
                  </div>
                  <h1>{project.project}</h1>
                  <div className={`${styles.where} mono`}>
                    {where} · {project.county} County
                    {project.address ? ` · ${project.address}` : ""}
                  </div>

                  <div className={styles.badges}>
                    <span
                      className={`${styles.badge} ${
                        styles[`t_${statusTone(project.status)}`]
                      }`}
                    >
                      {statusLabel(project.status)}
                    </span>
                    {project.soldOut && (
                      <span className={`${styles.badge} ${styles.t_none}`}>
                        Sold out
                      </span>
                    )}
                    {strAllowsShortTerm(project) && (
                      <span className={`${styles.badge} ${styles.badgeStr}`}>
                        Short-term rental OK
                      </span>
                    )}
                  </div>

                  <div className={`${styles.rid} mono`}>
                    RECORD <b>#{preconRecordId(project)}</b> · Preconstruction
                    {project.deliveryYear
                      ? ` · Delivery ${project.deliveryYear}`
                      : ""}
                  </div>
                </header>

                {/* ---- foreign-national financing hook ---- */}
                <section className={styles.hook} id="foreign-national">
                  <div className={`${styles.hookKicker} mono`}>
                    Foreign-national financing
                  </div>
                  <h2 className={styles.hookHead}>
                    Buying from overseas? You may not need to pay all cash.
                  </h2>
                  <p className={styles.hookLede}>
                    Most overseas buyers are told a South Florida preconstruction
                    purchase is a cash deal. It often isn&rsquo;t. Non-resident
                    foreign-national loan programs are built for buyers without US
                    credit or US income history: a qualified purchaser can finance
                    the bulk of the price through a US lender and bring the rest as
                    a down payment. Lenders underwrite the property and your
                    documented finances from home rather than a US credit score.
                  </p>

                  {illustration ? (
                    <div className={styles.compare}>
                      <div className={styles.compareCol}>
                        <div className={styles.compareLabel}>
                          Paying all cash
                        </div>
                        <div className={`${styles.compareBig} mono`}>
                          {illustration.price}
                        </div>
                        <div className={styles.compareNote}>
                          Full price out of pocket, from this project&rsquo;s
                          published starting price.
                        </div>
                      </div>
                      <div className={`${styles.compareCol} ${styles.compareOn}`}>
                        <div className={styles.compareLabel}>
                          Financed · {illustration.downPct} down
                        </div>
                        <div className={`${styles.compareBig} mono`}>
                          {illustration.down}
                        </div>
                        <div className={styles.compareNote}>
                          Your cash at closing. The remaining{" "}
                          <b className="mono">{illustration.financed}</b> (
                          {illustration.financedPct}) is what a US lender would be
                          asked to finance.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.compareNone}>
                      This project has no published starting price in our file yet,
                      so we can&rsquo;t show a like-for-like comparison. As a rule
                      of thumb, non-resident programs commonly start around{" "}
                      <b>35% down</b>, leaving roughly two-thirds of the price
                      financed.
                    </div>
                  )}

                  <p className={styles.hookDisclaimer}>
                    <b>Illustrative only.</b> The figures above are a simple
                    arithmetic example built from the project&rsquo;s starting
                    price — not a quote, a rate, an approval, or a commitment to
                    lend. Actual down payment, rate, reserve and documentation
                    requirements depend on the lender, the program, the project,
                    and your own situation, and preconstruction deposit schedules
                    set by the developer are separate from any loan, which
                    typically funds at closing. SoFloCondoVerify is not a lender.
                  </p>

                  <Link className={styles.hookBtn} href={connect("foreign-national")}>
                    Ask about foreign-national financing
                  </Link>
                  <div className={styles.hookFine}>
                    Free · no account required · no obligation
                  </div>
                </section>

                {/* ---- facts ---- */}
                <div className={styles.factsHead}>Project facts</div>
                <table className={styles.facts}>
                  <tbody>
                    <Fact label="Status" value={statusLabel(project.status)} />
                    <Fact label="Delivery" value={project.delivery} />
                    <Fact label="Price from" value={price} />
                    <Fact
                      label="Short-term rental / Airbnb"
                      value={str.value}
                      detail={str.detail}
                    />
                    <Fact label="Bedrooms" value={project.bedrooms} />
                    <Fact label="Interior square feet" value={project.sfRange} />
                    <Fact label="Units" value={project.units} />
                    <Fact label="Floors" value={project.floors} />
                    <Fact label="Architect" value={project.architect} />
                    <Fact
                      label="Developer"
                      value={project.developer}
                      href={project.developer ? devHref : null}
                    />
                    <Fact label="Address" value={project.address} />
                    <Fact
                      label="Sales"
                      value={project.soldOut ? "Sold out" : null}
                    />
                  </tbody>
                </table>

                <footer className={styles.recFoot}>
                  <p>
                    Project details are compiled from developer and public sources
                    as published and change as a project moves through
                    construction. Where a field is missing, nothing was on file for
                    it — that is not a finding about the project. Nothing here is
                    an offer to sell or a solicitation to buy.
                  </p>
                  <p className="mono">
                    Not legal or financial advice · Not affiliated with any
                    government agency
                  </p>
                </footer>
              </article>

              {/* ---- related ---- */}
              <nav className={styles.related} aria-label="Related pages">
                <div className={styles.relatedHead}>Related</div>
                <ul className={styles.relatedList}>
                  <li>
                    <Link href="/preconstruction">
                      All South Florida preconstruction projects
                    </Link>
                  </li>
                  {devHref && project.developer && (
                    <li>
                      <Link href={devHref}>
                        More from {project.developer}
                      </Link>
                    </li>
                  )}
                </ul>

                {related.length > 0 && (
                  <>
                    <div className={styles.relatedSub}>
                      Also in {project.area}
                    </div>
                    <ul className={styles.relatedList}>
                      {related.map((other) => (
                        <li key={other.slug}>
                          <Link href={preconHref(other)}>{other.project}</Link>
                          <span className={`${styles.relatedMeta} mono`}>
                            {[
                              statusLabel(other.status),
                              other.deliveryYear ? `${other.deliveryYear}` : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </nav>
            </main>

            <aside className={styles.side}>
              <div className={styles.cta}>
                <div className={styles.ctaHead}>Get connected — free</div>
                <div className={styles.ctaBody}>
                  <p className={styles.ctaLede}>
                    We&rsquo;re an independent record, not a sales office. Tell us
                    what you need and we&rsquo;ll match you with a licensed
                    professional who can answer it for this project.
                  </p>
                  <div className={styles.ctaBtns}>
                    <Link
                      className={styles.btnPrimary}
                      href={connect("foreign-national")}
                    >
                      Foreign-national loan
                    </Link>
                    <Link className={styles.btnSecondary} href={connect("finance")}>
                      Finance a purchase
                    </Link>
                    <Link
                      className={styles.btnSecondary}
                      href={connect("check-building")}
                    >
                      Ask about this project
                    </Link>
                  </div>
                  <p className={styles.ctaFine}>
                    Free · no account required · no obligation
                  </p>
                </div>
              </div>

              <div className={styles.note}>
                <div className={styles.noteHead}>What a precon record is</div>
                <p>
                  Preconstruction projects have no FHA, VA, milestone or reserve
                  history yet — those signals only exist once a building is
                  standing and filed. What&rsquo;s on this page is the project as
                  published, plus the financing question most buyers ask first.
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

/** Renders nothing when the value is empty — no blank rows on the record. */
function Fact({
  label,
  value,
  detail,
  href,
}: {
  label: string;
  value: string | null | undefined;
  detail?: string | null;
  href?: string | null;
}) {
  const clean = value?.trim();
  if (!clean) return null;

  return (
    <tr>
      <th scope="row" className={styles.factL}>
        {label}
      </th>
      <td className={styles.factV}>
        {href ? <Link href={href}>{clean}</Link> : clean}
        {detail?.trim() && detail.trim() !== clean && (
          <span className={styles.factDetail}>{detail.trim()}</span>
        )}
      </td>
    </tr>
  );
}
