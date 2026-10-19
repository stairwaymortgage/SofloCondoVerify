import { getAllPosts } from "@/lib/blog";
import { urlSet, xmlResponse } from "@/lib/sitemap";

export const revalidate = 3600;

/**
 * The Markdown-driven guides under /blog. The auto-post engine writes new
 * posts into content/blog, so this segment grows on its own; lastmod comes
 * from each post's frontmatter date.
 */
export function GET() {
  const posts = getAllPosts();
  return xmlResponse(
    urlSet([
      { path: "/blog" },
      ...posts.map((post) => ({
        path: `/blog/${post.slug}`,
        lastModified: post.date || null,
      })),
    ])
  );
}
