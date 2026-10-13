import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Markdown-driven blog.
 *
 * Posts live as `content/blog/<slug>.md` and are read from disk at build time
 * — there is no database behind the blog, deliberately. The auto-post engine
 * writes files into that directory and appends the niche to
 * `data/published-niches.json`; this module is the read side, shared by the
 * index (`/blog`) and each post (`/blog/[slug]`).
 *
 * The frontmatter contract is fixed (see `PostFrontmatter`). The engine emits
 * exactly these keys, and `parsePost` tolerates a missing optional field
 * rather than throwing, so a half-filled draft never fails the whole build.
 */

/** Where posts are read from, relative to the repo root. */
export const POSTS_DIR = path.join(process.cwd(), "content", "blog");

export interface FaqItem {
  q: string;
  a: string;
}

export interface PostFrontmatter {
  title: string;
  description: string;
  /** Must equal the filename without `.md`. */
  slug: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  tag: string;
  /** Absolute URL, or "" when there is no hero image. */
  heroImage: string;
  heroAlt: string;
  faq: FaqItem[];
}

export interface Post extends PostFrontmatter {
  /** The Markdown body, with no leading H1. */
  body: string;
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Normalises the `faq` block into `{ q, a }[]`, dropping incomplete pairs. */
function parseFaq(value: unknown): FaqItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      q: str((item as Record<string, unknown>)?.q),
      a: str((item as Record<string, unknown>)?.a),
    }))
    .filter((item) => item.q && item.a);
}

/** True for a readable `.md` file (ignores dotfiles and drafts prefixed `_`). */
function isPostFile(name: string): boolean {
  return name.endsWith(".md") && !name.startsWith(".") && !name.startsWith("_");
}

function parsePost(fileName: string): Post | null {
  const fullPath = path.join(POSTS_DIR, fileName);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);

  const fileSlug = fileName.replace(/\.md$/, "");
  // The contract says slug === filename; trust the filename either way, so a
  // mismatched `slug:` in frontmatter can never route a post to the wrong URL.
  const slug = str(data.slug) || fileSlug;

  const title = str(data.title);
  if (!title) return null; // a post with no title is not publishable

  return {
    title,
    description: str(data.description),
    slug: fileSlug,
    date: str(data.date),
    tag: str(data.tag),
    heroImage: str(data.heroImage),
    heroAlt: str(data.heroAlt),
    faq: parseFaq(data.faq),
    body: content.trim(),
  };
}

/** Every post, newest first. Returns [] when the directory does not exist. */
export function getAllPosts(): Post[] {
  let names: string[];
  try {
    names = fs.readdirSync(POSTS_DIR);
  } catch {
    return [];
  }

  return names
    .filter(isPostFile)
    .map(parsePost)
    .filter((post): post is Post => post !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** One post by slug, or null when there is no such file. */
export function getPost(slug: string): Post | null {
  return getAllPosts().find((post) => post.slug === slug) ?? null;
}
