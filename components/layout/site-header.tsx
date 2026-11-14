import Link from "next/link";
import { serviceHref, services } from "@/content/services";
import { mainRoutes, servicesHref, type SiteRoute } from "@/lib/site";
import { BrandLogo } from "./brand-logo";
import { HeaderTone } from "./header-tone";
import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";
import styles from "./site-header.module.css";

/** Mobil menüde "Hizmetlerimiz" altında listelenen detay sayfaları. */
const subRoutes: Record<string, readonly SiteRoute[]> = {
  [servicesHref]: services.map((service) => ({ href: serviceHref(service.slug), label: service.shortTitle })),
};

export function SiteHeader() {
  return (
    <header className={styles.header} data-tone="header" data-site-header>
      <div className={`container ${styles.bar}`}>
        <Link href="/" className={styles.home} aria-label="SONEF Teknoloji ana sayfa">
          {/* Beyaz navbarda lacivert, lacivert navbarda krem logo; görünürlüğü CSS seçer. */}
          <span className={styles.logoStack}>
            <BrandLogo variant="navy" className={styles.logoLight} />
            <BrandLogo variant="cream" className={styles.logoDark} />
          </span>
        </Link>

        <nav aria-label="Ana menü" className={styles.desktopNav}>
          <ul className={styles.desktopList}>
            {mainRoutes.slice(1).map((route) => (
              <li key={route.href}>
                <NavLink href={route.href} className={styles.desktopLink}>
                  {route.shortLabel ?? route.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <MobileNav routes={mainRoutes} subRoutes={subRoutes} />
        <HeaderTone />
      </div>
    </header>
  );
}
