"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Masthead.module.css";

/** One list, rendered twice: inline on desktop, in the panel on mobile. */
const NAV = [
  { href: "/", label: "Look up" },
  { href: "/preconstruction", label: "Preconstruction" },
  { href: "/developers", label: "Developers" },
  { href: "/buyers", label: "Buyers" },
  { href: "/sellers", label: "Sellers" },
  { href: "/foreign-buyers", label: "Foreign buyers" },
  { href: "/rules", label: "Rules" },
  { href: "/for-boards", label: "For boards" },
];

const ADVERTISE = { href: "/advertise", label: "Advertise with us" };

/**
 * Site masthead.
 *
 * A client component only because the mobile menu needs toggle state. Below
 * 720px the inline nav and the CTA are both hidden and a hamburger takes
 * their place — previously the links were hidden with nothing to open them,
 * which left the entire nav unreachable on a phone, and the brand plus the
 * CTA together overflowed a 375px viewport by 30px on every page.
 */
export default function Masthead() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Close on navigation. Clicking a link to the current page fires no route
  // change, so the links also close it themselves on click.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (burgerRef.current?.contains(target)) return; // its own handler toggles
      setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        burgerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <div className={styles.authstrip}>
        <div className="wrap">
          <span className={styles.fi} aria-hidden />
          <span>
            An independent condo verification record for <b>South Florida</b>
          </span>
          <span className={`${styles.right} mono`}>
            Sourced from HUD · VA · FL DBPR · county registries
          </span>
        </div>
      </div>

      <header className={styles.mast}>
        <div className={`wrap ${styles.inner}`}>
          <Link href="/" className={styles.brand}>
            <span className={styles.seal} aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 2l7 3.5v6c0 5-3.4 8-7 10-3.6-2-7-5-7-10v-6z" />
                <path d="M9 12l2 2 4-4.5" />
              </svg>
            </span>
            <span className={styles.wm}>
              <span className={styles.t}>
                SoFloCondo<span>Verify</span>
              </span>
              <span className={styles.s}>Condo Verification Record</span>
            </span>
          </Link>

          <nav className={styles.links} aria-label="Main">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link href={ADVERTISE.href} className={styles.cta}>
              {ADVERTISE.label}
            </Link>
          </nav>

          <button
            ref={burgerRef}
            type="button"
            className={styles.burger}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className={styles.burgerBars} aria-hidden>
              <span data-open={open || undefined} />
              <span data-open={open || undefined} />
              <span data-open={open || undefined} />
            </span>
            <span className={styles.burgerText}>Menu</span>
          </button>
        </div>

        {/* Always in the DOM so aria-controls resolves; hidden collapses it. */}
        <div
          id="mobile-menu"
          ref={panelRef}
          className={styles.panel}
          hidden={!open}
        >
          <nav aria-label="Site">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={ADVERTISE.href}
              className={styles.panelCta}
              onClick={() => setOpen(false)}
            >
              {ADVERTISE.label}
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
