import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import ConnectCta from "@/components/ConnectCta";
import JsonLd from "@/components/JsonLd";
import { supabase } from "@/lib/supabase";
import { breadcrumbSchema } from "@/lib/schema";
import type { Form } from "@/lib/database.types";
import styles from "./page.module.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Condo forms & templates · SoFloCondoVerify",
  description:
    "The documents that come up around a Florida condo transaction — estoppel requests, records inspection requests, lender questionnaires, FHA project certification — with the authority behind each.",
};

/**
 * The catalog carries a trailing NOTE row from the workbook import rather than
 * a ninth form. Dropped here, not rendered as an empty entry.
 */
function isRealForm(row: Form): boolean {
  const name = row.form_template?.trim();
  return Boolean(name) && !/^note:/i.test(name!) && Boolean(row.purpose?.trim());
}

async function getForms(): Promise<Form[]> {
  const { data, error } = await supabase.from("forms").select("*").order("id");

  if (error) {
    console.error("[forms]", error.message);
    return [];
  }
  return ((data ?? []) as Form[]).filter(isRealForm);
}

/**
 * host_or_link holds a plan ("Link", "Template", "Host"), not a URL — the
 * catalog is a seed list of what we intend to publish or point at. Until real
 * destinations land, each row says where it will come from rather than
 * pretending to be a download.
 */
function availability(form: Form): { label: string; detail: string } {
  switch (form.host_or_link?.trim()) {
    case "Link":
      return {
        label: "Official source",
        detail:
          "Published by the authority named — we will link theirs rather than host a copy.",
      };
    case "Template":
      return {
        label: "Template",
        detail: "A plain-language template we intend to publish here.",
      };
    case "Host":
      return {
        label: "Explainer",
        detail: "An explainer we intend to publish here.",
      };
    default:
      return { label: "Not yet classified", detail: "Sourcing not yet decided." };
  }
}

function statusTone(status: string | null): "caution" | "none" {
  return status?.trim() === "Draft" ? "caution" : "none";
}

export default async function FormsPage() {
  const forms = await getForms();

  return (
    <>
      <JsonLd
        schemas={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Forms", path: "/forms" },
          ]),
        ]}
      />
      <Masthead />

      <section className={styles.page}>
        <div className="wrap">
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "Forms" }]} />

          <header className={styles.head}>
            <div className={`${styles.doc} mono`}>Forms &amp; templates</div>
            <h1>The paperwork a condo deal runs on</h1>
            <p className={styles.lede}>
              These are the documents that decide whether a Florida condo
              transaction moves or stalls — what each one is for, and the statute
              or programme behind it.
            </p>
            <p className={styles.warn}>
              <b>Seed catalog — nothing here is downloadable yet.</b> This is the
              working list of what we intend to publish or link, with{" "}
              {forms.length} entries so far. Where a row names an official form, go
              to the authority named in its row; where it names a template, it is
              something we plan to write. We would rather show the list honestly
              than link to files that don&rsquo;t exist.
            </p>
          </header>

          <div className={styles.grid}>
            <main>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Document</th>
                    <th scope="col">What it&rsquo;s for</th>
                    <th scope="col">Authority</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {forms.map((form) => {
                    const source = availability(form);
                    return (
                      <tr key={form.id}>
                        <th scope="row" className={styles.name}>
                          {form.form_template}
                          <span className={styles.avail}>{source.label}</span>
                        </th>
                        <td className={styles.purpose}>
                          {form.purpose}
                          <span className={styles.availDetail}>{source.detail}</span>
                        </td>
                        <td className={`${styles.authority} mono`}>
                          {form.source_authority ?? "—"}
                        </td>
                        <td className={styles.status}>
                          <span
                            className={`${styles.chip} ${
                              styles[`t_${statusTone(form.status)}`]
                            }`}
                          >
                            {form.status?.trim() || "Planned"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className={styles.note}>
                <div className={styles.noteHead}>Where these come from</div>
                <p>
                  Estoppel certificates, records inspection and the turnover
                  checklist come out of Chapter 718 — our{" "}
                  <Link href="/rules/chapter-718-condo-act">
                    Chapter 718 explainer
                  </Link>{" "}
                  sets out the deadlines that attach to them. The lender
                  questionnaire and FHA project certification are programme
                  documents, covered in{" "}
                  <Link href="/rules/conventional-full-review-2026">
                    the 2026 conventional change
                  </Link>{" "}
                  and{" "}
                  <Link href="/rules/fha-approval-and-single-unit">
                    FHA project approval
                  </Link>
                  . The SIRS and milestone explainer pairs with{" "}
                  <Link href="/rules/sirs-reserve-studies">reserve studies</Link>.
                </p>
                <p>
                  Forms and their statutory basis change. Use the authority named
                  in each row as the source of truth, and take anything that
                  affects a decision to a Florida attorney.
                </p>
                <p className="mono">
                  Not legal or financial advice · Not affiliated with any government
                  agency
                </p>
              </div>
            </main>

            <aside className={styles.side}>
              <ConnectCta
                lede="Not sure which document you need, or who has to sign it? A licensed professional can tell you in one conversation — free, and no obligation."
                actions={[
                  { intent: "check-building", label: "Ask about a building" },
                  { intent: "board", label: "I'm on a condo board" },
                  { intent: "sell", label: "Sell my unit" },
                ]}
              />

              <nav className={styles.nearby} aria-label="Elsewhere">
                <div className={styles.nearbyHead}>Elsewhere</div>
                <ul>
                  <li>
                    <Link href="/rules">Rules &amp; requirements</Link>
                  </li>
                  <li>
                    <Link href="/for-boards">For condo boards</Link>
                  </li>
                  <li>
                    <Link href="/associations">Association registry</Link>
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
