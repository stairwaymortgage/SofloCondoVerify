import { getPreconProjects, preconHref } from "@/lib/precon";
import { urlSet, xmlResponse } from "@/lib/sitemap";

export const revalidate = 3600;

export async function GET() {
  const projects = await getPreconProjects();

  return xmlResponse(
    urlSet([
      { path: "/preconstruction" },
      ...projects.map((project) => ({ path: preconHref(project) })),
    ])
  );
}
