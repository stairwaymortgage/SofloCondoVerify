"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./Masthead.module.css";

interface NavLink {
  href: string;
  label: string;
}

interface NavGroup {
  label: string;
  /** Rendered as a dropdown on desktop and as an open section on mobile. */
  children: NavLink[];
}

type NavItem = NavLink | NavGroup;

/**
 * One list, rendered twice: inline on desktop, in the panel on mobile.
 *
 * A grouped item is a presentational container only — "Resources" has no
 * route of its own. Its children keep their own URLs, stay in the sitemap and
 * are rendered into the server HTML in both places, open or closed, so
 * grouping them costs them nothing in crawlability.
 */
const NAV: NavItem[] = [
  { href: "/", label: "Look up" },
  { href: "/preconstruction", label: "Preconstruction" },
  { href: "/buyers", label: "Buyers" },
  { href: "/sellers", label: "Sellers" },
  { href: "/foreign-buyers", label: "Foreign buyers" },
  { href: "/associations", label: "Associations" },
  { href: "/for-boards", label: "For boards" },
  {
    label: "Resources",
    children: [
      { href: "/rules", label: "Rules" },
      { href: "/forms", label: "Forms" },
      { href: "/developers", label: "Developers" },
    ],
  },
];

function isGroup(item: NavItem): item is NavGroup {
  return "children" in item;
}

/**
 * Whether a nav href covers the current route. Section pages count as their
 * section — /rules/sb4d-milestone-inspections marks Rules, and so Resources,
 * as current. "/" is exact, or it would match everything.
 */
function covers(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Site masthead.
 *
 * A client component because the mobile menu and the Resources dropdown both
 * need toggle state. Below 720px the inline nav is hidden and a hamburger
 * takes its place — previously the links were hidden with nothing to open
 * them, which left the entire nav unreachable on a phone.
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
            {/* alt="" on purpose: the wordmark beside it already names the
                site, so announcing the mark again would just be noise. The
                source is a square with a white margin, clipped to a circle
                in CSS — next/image serves it down to the 42px it renders at
                rather than shipping the 1536px original. */}
            <Image
              src="/logo.jpeg"
              alt=""
              width={42}
              height={42}
              className={styles.seal}
              priority
            />
            <span className={styles.wm}>
              <span className={styles.t}>
                SoFloCondo<span>Verify</span>
              </span>
              <span className={styles.s}>Condo Verification Record</span>
            </span>
          </Link>

          <nav className={styles.links} aria-label="Main">
            {NAV.map((item) =>
              isGroup(item) ? (
                <NavDropdown key={item.label} group={item} pathname={pathname} />
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={covers(pathname, item.href) ? styles.on : undefined}
                  aria-current={covers(pathname, item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              )
            )}
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
            {NAV.map((item) =>
              isGroup(item) ? (
                // No hover affordance on a touch screen, so the group is not
                // a disclosure here: the heading is a label and its children
                // sit open beneath it. Every destination stays one tap away.
                <div key={item.label} className={styles.panelGroup}>
                  <div className={styles.panelGroupHead}>{item.label}</div>
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`${styles.panelChild} ${
                        covers(pathname, child.href) ? styles.panelOn : ""
                      }`}
                      aria-current={
                        covers(pathname, child.href) ? "page" : undefined
                      }
                      onClick={() => setOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={covers(pathname, item.href) ? styles.panelOn : undefined}
                  aria-current={covers(pathname, item.href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>
        </div>
      </header>
    </>
  );
}

/**
 * Desktop dropdown for a grouped nav item.
 *
 * Opens on hover for a mouse and on click for everything else, because hover
 * alone is unreachable by keyboard and touch. The panel is always in the DOM
 * and collapsed with `hidden`, so its links ship in the server HTML whether
 * or not anyone opens it.
 */
function NavDropdown({
  group,
  pathname,
}: {
  group: NavGroup;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);

  const active = group.children.some((child) => covers(pathname, child.href));

  // A completed navigation should not leave the menu hanging open.
  useEffect(() => setOpen(false), [pathname]);

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape" && open) {
      event.stopPropagation(); // the mobile panel's handler is not ours
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    // Down-arrow is the expected way into a menu from its trigger.
    if (event.key === "ArrowDown" && event.target === triggerRef.current) {
      event.preventDefault();
      setOpen(true);
      // Wait for `hidden` to come off before trying to focus into the panel.
      requestAnimationFrame(() => firstItemRef.current?.focus());
    }
  }

  return (
    <div
      ref={wrapRef}
      className={styles.group}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onKeyDown={onKeyDown}
      // Tabbing past the last item closes the menu behind you. relatedTarget
      // is the element receiving focus; null (a click outside the window)
      // counts as leaving.
      onBlur={(event) => {
        if (!wrapRef.current?.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${active ? styles.on : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        aria-current={active ? "page" : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        {group.label}
        <span className={styles.caret} aria-hidden>
          ▾
        </span>
      </button>

      <ul className={styles.menu} hidden={!open}>
        {group.children.map((child, index) => (
          <li key={child.href}>
            <Link
              ref={index === 0 ? firstItemRef : undefined}
              href={child.href}
              className={covers(pathname, child.href) ? styles.menuOn : undefined}
              aria-current={covers(pathname, child.href) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {child.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
