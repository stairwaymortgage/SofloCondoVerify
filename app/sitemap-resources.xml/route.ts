import { RULE_TOPICS } from "@/lib/rules";
import { urlSet, xmlResponse } from "@/lib/sitemap";

export const revalidate = 3600;

/**
 * The hand-written explainers and libraries: rules, forms, board hub.
 *
 * /privacy is deliberately absent. It carries `noindex` while the notice is
 * a draft, and submitting a noindexed URL in a sitemap is a contradiction —
 * it asks Search Console to index a page the page itself refuses. /connect
 * is absent for the same reason.
 */
export function GET() {
  return xmlResponse(
    urlSet([
      { path: "/rules" },
      ...RULE_TOPICS.map((topic) => ({ path: `/rules/${topic.slug}` })),
      { path: "/forms" },
      { path: "/for-boards" },
      // The audience landing pages the masthead points at.
      { path: "/buyers" },
      { path: "/sellers" },
      { path: "/foreign-buyers" },
      { path: "/how-matching-works" },
    ])
  );
}
