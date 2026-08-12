import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import ConnectForm from "@/components/ConnectForm";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/lib/supabase";
import { normalizeIntent } from "@/lib/intents";
import { getPreconBySlug } from "@/lib/precon";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Get connected — free · SoFloCondoVerify",
  description:
    "Tell us what you need and we’ll pass your request to licensed professionals in our network. Free, no obligation.",
  // A form, not a record. It also takes ?record= and ?intent=, so every
  // record page would otherwise spawn its own indexable near-duplicate.
  // Canonicalised to the bare path and kept out of the index entirely.
  alternates: { canonical: "/connect" },
  robots: { index: false, follow: true },
};

/**
 * Prefill text for the building field, when arriving from a record page.
 * ?record= carries a numeric buildings.id from a verification record, or a
 * precon url_slug from a preconstruction project page.
 */
async function getPrefill(
  rawRecord: string | undefined
): Promise<{ id: number | null; label: string } | null> {
  if (!rawRecord) return null;

  const id = Number(rawRecord);
  if (!Number.isInteger(id) || id < 1) return getPreconPrefill(rawRecord);

  const { data, error } = await supabase
    .from("buildings")
    .select("id, building_name, address, city, zip")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const label = [
    data.building_name,
    [data.address, data.city, data.zip].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(" — ");

  return { id: data.id, label };
}

/**
 * Preconstruction projects aren't rows in `buildings`, so there is no
 * building_id to attach — the label carries the project instead.
 */
async function getPreconPrefill(
  rawRecord: string
): Promise<{ id: null; label: string } | null> {
  const project = await getPreconBySlug(rawRecord);
  if (!project) return null;

  const where = [project.area, project.county].filter(Boolean).join(", ");
  return { id: null, label: `${project.project} — ${where} (preconstruction)` };
}

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: { record?: string; intent?: string };
}) {
  const building = await getPrefill(searchParams.record);
  const intent = normalizeIntent(searchParams.intent);

  return (
    <>
      <Masthead />

      <section className={styles.page}>
        <div className="wrap">
          <div className={`${styles.crumb} mono`}>
            <Link href="/">Home</Link> / Get connected
          </div>

          <div className={styles.grid}>
            <main>
              <h1 className={styles.head}>Get connected — free</h1>
              <p className={styles.lede}>
                The public record shows what was filed. It can’t tell you whether a
                lender will actually write the loan, or what a building’s reserves
                look like in practice. Tell us what you need and we’ll pass your
                request along.
              </p>

              <ConnectForm
                defaultIntent={intent}
                buildingId={building?.id ?? null}
                buildingLabel={building?.label ?? ""}
                // The raw token, not building.id: a preconstruction project
                // has no buildings row, so this is the only identifier that
                // survives for those leads.
                recordId={searchParams.record?.trim() || null}
              />
            </main>

            <aside className={styles.side}>
              <div className={styles.card}>
                <div className={styles.cardHead}>What happens next</div>
                <ol className={styles.steps}>
                  <li>
                    <span className={styles.stepN}>1</span>
                    You send this request. No account, no fee.
                  </li>
                  <li>
                    <span className={styles.stepN}>2</span>
                    We pass it to one or more licensed professionals in our network who
                    handle your kind of request.
                  </li>
                  <li>
                    <span className={styles.stepN}>3</span>
                    They contact you directly. You decide whether to go further — with
                    any of them, or none.
                  </li>
                </ol>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHead}>What we are not</div>
                <p className={styles.plain}>
                  SoFloCondoVerify is an independent record. We are not a lender, a
                  brokerage, or a law firm, and nothing here is legal or financial
                  advice. We are not affiliated with any government agency.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
