import { companyHref, getCompanies } from "@/lib/companies";
import { urlSet, xmlResponse } from "@/lib/sitemap";

export const revalidate = 3600;

/**
 * Every company page, including those with no linked projects — each still
 * carries a name, type and headquarters, so none are thin in the way the FAQ
 * stubs were.
 */
export async function GET() {
  const companies = await getCompanies();

  return xmlResponse(
    urlSet([
      { path: "/developers" },
      ...companies
        .map((company) => companyHref(company))
        .filter((href): href is string => href !== null)
        .map((path) => ({ path })),
    ])
  );
}
