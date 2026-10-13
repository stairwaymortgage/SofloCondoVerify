import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { marked } from "marked";
import Masthead from "@/components/Masthead";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import SiteFooter from "@/components/SiteFooter";
import { articleSchema, breadcrumbSchema, siteUrl } from "@/lib/schema";
import { getAllPosts, getPost, type Post } from "@/lib/blog";
import styles from "../blog.module.css";

/** Everything is read from disk at build time; the post set is fully static. */
export const dynamic = "force-static";
export const dynamicParams = false;

marked.setOptions({ gfm: true, breaks: false });

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

interface Params {
  params: { slug: string };
}

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function generateMetadata({ params }: Params): Metadata {
  const post = getPost(params.slug);
  if (!post) return {};

  const path = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: siteUrl(path),
      publishedTime: post.date || undefined,
      images: post.heroImage ? [{ url: post.heroImage, alt: post.heroAlt }] : undefined,
    },
  };
}

/** FAQPage JSON-LD for a post's Q&A block (multi-question). */
function faqSchema(post: Post, path: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteUrl(path)}#faq`,
    mainEntity: post.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export default function BlogPost({ params }: Params) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const path = `/blog/${post.slug}`;
  const bodyHtml = marked.parse(post.body) as string;

  const schemas: Record<string, unknown>[] = [
    articleSchema(post.title, post.description, path, post.date),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Guides", path: "/blog" },
      { name: post.title, path },
    ]),
  ];
  if (post.faq.length > 0) schemas.push(faqSchema(post, path));

  return (
    <>
      <JsonLd schemas={schemas} />
      <Masthead />

      <section className={styles.postPage}>
        <div className="wrap">
          <Breadcrumbs
            trail={[
              { name: "Home", href: "/" },
              { name: "Guides", href: "/blog" },
              { name: post.title },
            ]}
          />

          <article className={styles.article}>
            <header className={styles.postHead}>
              <div className={styles.cardMeta}>
                {post.tag && <span className={styles.tag}>{post.tag}</span>}
                {post.date && (
                  <time className={`${styles.date} mono`} dateTime={post.date}>
                    {formatDate(post.date)}
                  </time>
                )}
              </div>
              <h1 className={styles.postTitle}>{post.title}</h1>
              {post.description && (
                <p className={styles.postStand}>{post.description}</p>
              )}
            </header>

            {post.heroImage && (
              <Image
                className={styles.hero}
                src={post.heroImage}
                alt={post.heroAlt}
                width={1160}
                height={620}
                priority
              />
            )}

            <div
              className={styles.prose}
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />

            {post.faq.length > 0 && (
              <section className={styles.faq} aria-labelledby="faq-head">
                <h2 id="faq-head" className={styles.faqHead}>
                  Frequently asked questions
                </h2>
                <dl className={styles.faqList}>
                  {post.faq.map((item, index) => (
                    <div key={index} className={styles.faqItem}>
                      <dt className={styles.faqQ}>{item.q}</dt>
                      <dd className={styles.faqA}>{item.a}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <footer className={styles.disclaimer}>
              <p className="mono">
                Independent record · Not legal, engineering, or financial advice ·
                Not affiliated with any government agency
              </p>
            </footer>
          </article>

          {/* On-site CTA only — points to the real condo lookup, never an
              external pitch. */}
          <aside className={styles.toolCta}>
            <div className={styles.toolCtaBody}>
              <div className={`${styles.toolCtaKicker} mono`}>Check the record</div>
              <p>
                Reading about a building is only the start. Look up any condo in
                Miami-Dade, Broward, or Palm Beach and see its signals, each
                dated and linked to its official source.
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
