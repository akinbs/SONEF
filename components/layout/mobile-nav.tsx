"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { SiteRoute } from "@/lib/site";
import { NavLink } from "./nav-link";
import styles from "./site-header.module.css";

/**
 * Dar ekran menüsü. Bağlantılar her zaman gerçek `<a>` öğeleridir; JavaScript
 * yüklenemezse aynı bağlantılar footer'da da bulunur.
 */
type MobileNavProps = {
  routes: readonly SiteRoute[];
  /** Bir ana bağlantının altında girintili listelenen alt sayfalar (ör. hizmet detayları). */
  subRoutes?: Readonly<Record<string, readonly SiteRoute[]>>;
};

export function MobileNav({ routes, subRoutes = {} }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className={styles.mobile}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.menuButton}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.menuIcon} data-open={open} aria-hidden="true" />
        <span>{open ? "Kapat" : "Menü"}</span>
      </button>

      <nav id={panelId} aria-label="Ana menü (mobil)" className={styles.mobilePanel} hidden={!open}>
        <ul className={styles.mobileList}>
          {routes.map((route) => (
            <li key={route.href}>
              <NavLink href={route.href} className={styles.mobileLink} onClick={() => setOpen(false)}>
                {route.label}
              </NavLink>
              {subRoutes[route.href]?.length ? (
                <ul className={styles.mobileSubList}>
                  {subRoutes[route.href].map((child) => (
                    <li key={child.href}>
                      <NavLink href={child.href} className={styles.mobileSubLink} onClick={() => setOpen(false)}>
                        {child.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
