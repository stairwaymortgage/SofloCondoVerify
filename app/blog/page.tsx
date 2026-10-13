import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import SiteFooter from "@/components/SiteFooter";
import { breadcrumbSchema } from "@/lib/schema";
import { getAllPosts } from "@/lib/blog";
import styles from "./blog.module.css";

/**
 * The blog is read from `content/blog/*.md` on disk at build time, so the page
 * is fully static — there is no request-time work to do.
 */
export const dynamic = "force-static";

const PATH = "/blog";

export const metadata: Metadata = {
  title: "Condo Due-Diligence Guides",
  description:
    "Neutral, cited guides to verifying a South Florida condo: Milestone inspections, reserve studies, approval status, and the public records behind each.",
  alternates: { canonical: PATH },
};

/** Formats an ISO date as a readable long form, leaving bad input untouched. */
function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <>
      <JsonLd
        schemas={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Guides", path: PATH },
          ]),
        ]}
      />
      <Masthead />

      <section className={styles.page}>
        <div className="wrap">
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "Guides" }]} />

          <header className={styles.intro}>
            <div className={`${styles.kicker} mono`}>Condo due-diligence guides</div>
            <h1 className={styles.head}>
              How to read a South Florida condo before you buy
            </h1>
            <p className={styles.lede}>
              Plain-language explainers on the records that decide whether a
              building clears — Milestone inspections, reserve studies, FHA and
              VA standing, and the official sources behind each. Every guide is
              cited, dated, and points you to where to confirm the specifics.
            </p>
          </header>

          {posts.length === 0 ? (
            <p className={styles.empty}>No guides have been published yet.</p>
          ) : (
            <ul className={styles.cards}>
              {posts.map((post) => (
                <li key={post.slug} className={styles.card}>
                  <Link href={`/blog/${post.slug}`} className={styles.cardLink}>
                    <div className={styles.cardMeta}>
                      {post.tag && <span className={styles.tag}>{post.tag}</span>}
                      {post.date && (
                        <time className={`${styles.date} mono`} dateTime={post.date}>
                          {formatDate(post.date)}
                        </time>
                      )}
                    </div>
                    <h2 className={styles.cardTitle}>{post.title}</h2>
                    {post.description && (
                      <p className={styles.cardDesc}>{post.description}</p>
                    )}
                    <span className={styles.cardMore}>Read the guide &rarr;</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <aside className={styles.toolCta}>
            <div className={styles.toolCtaBody}>
              <div className={`${styles.toolCtaKicker} mono`}>Start with the record</div>
              <p>
                Every guide points back to one place: the building itself. Look
                up any condo in Miami-Dade, Broward, or Palm Beach and see its
                signals, each dated and linked to its official source.
              </p>
            </div>
            <Link href="/" className={styles.toolCtaBtn}>
              Verify a condo
            </Link>
          </aside>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
