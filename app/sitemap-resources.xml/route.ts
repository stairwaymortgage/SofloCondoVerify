import { RULE_TOPICS } from "@/lib/rules";
import { urlSet, xmlResponse } from "@/lib/sitemap";

export const revalidate = 3600;

/** The hand-written explainers and libraries: rules, forms, board hub. */
export function GET() {
  return xmlResponse(
    urlSet([
      { path: "/rules" },
      ...RULE_TOPICS.map((topic) => ({ path: `/rules/${topic.slug}` })),
      { path: "/forms" },
      { path: "/for-boards" },
    ])
  );
}
