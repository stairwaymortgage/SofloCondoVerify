import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import ConnectForm from "@/components/ConnectForm";
import { supabase } from "@/lib/supabase";
import { normalizeIntent } from "@/lib/intents";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Get connected — free · SoFloCondoVerify",
  description:
    "Tell us what you need and we’ll pass your request to licensed professionals in our network. Free, no obligation.",
};

/** Prefill text for the building field, when arriving from a record page. */
async function getBuildingPrefill(
  rawRecord: string | undefined
): Promise<{ id: number; label: string } | null> {
  const id = Number(rawRecord);
  if (!Number.isInteger(id) || id < 1) return null;

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

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: { record?: string; intent?: string };
}) {
  const building = await getBuildingPrefill(searchParams.record);
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
