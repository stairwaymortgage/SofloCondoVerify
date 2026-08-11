"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Client-side page_view for App Router navigations.
 *
 * gtag's `config` call fires the first page_view itself; every route change
 * after that is a soft navigation GA never sees. This fills the gap.
 *
 * It reads `window.location.search` rather than `useSearchParams()` on
 * purpose: that hook forces any page containing it out of static rendering
 * unless it is wrapped in Suspense, and this component sits in the root
 * layout — it would have deopted the entire prerendered site.
 */
export default function PageViews() {
  const pathname = usePathname();
  // The config call already counted the landing page; don't double-count it.
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (typeof window.gtag !== "function") return;

    window.gtag("event", "page_view", {
      page_path: `${pathname}${window.location.search}`,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
}
