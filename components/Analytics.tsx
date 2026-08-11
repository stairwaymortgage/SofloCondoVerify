import Script from "next/script";
import { gaId } from "@/lib/analytics";
import PageViews from "./PageViews";

/**
 * GA4, loaded only when NEXT_PUBLIC_GA_ID is set in the environment.
 *
 * `afterInteractive` keeps gtag.js off the critical path — it is not
 * render-blocking and does not compete with the record content for the LCP.
 * With no ID configured this renders nothing at all: no script tag, no
 * requests, no cookie.
 */
export default function Analytics() {
  const id = gaId();
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}', { send_page_view: true });`}
      </Script>
      <PageViews />
    </>
  );
}
