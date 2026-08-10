import { getAllFaqRoutes } from "@/lib/faq";
import { urlSet, xmlResponse } from "@/lib/sitemap";

export const revalidate = 3600;

/**
 * Only answers that clear the thin-content guard. Thin ones stay linked from
 * their city hub and carry noindex — listing them here would ask Google to
 * index pages we've told it not to.
 */
export async function GET() {
  const routes = await getAllFaqRoutes();

  return xmlResponse(
    urlSet(
      routes.map((route) => ({
        path: `/condos/${route.county}/${route.city}/faq/${route.slug}`,
      }))
    )
  );
}
