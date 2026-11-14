import { BackdropImage } from "@/components/ui/backdrop-image";
import { serviceHref, services } from "@/content/services";
import { mainRoutes, servicesHref, siteName } from "@/lib/site";
import { BrandLogo } from "./brand-logo";
import { NavLink } from "./nav-link";
import styles from "./site-footer.module.css";

/** Ana sayfa footer'ının fotoğrafı (eski ana sayfa kapanış bandının net fotoğrafı, kullanıcı görseli). */
const HOME_FOOTER_PHOTO = "/backgrounds/kapanis-hd.webp";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} data-tone="card" data-site-footer>
      {/* Yalnızca ana sayfada görünür (CSS: :root:has([data-journey])): lacivert tema + fotoğraf.
          Diğer sayfalarda katman display:none; tembel yüklenen görsel orada indirilmez. */}
      <BackdropImage src={HOME_FOOTER_PHOTO} variant="clear" className={styles.homeBackdrop} />
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <span className={styles.logoStack}>
            <BrandLogo variant="navy" className={styles.logoLight} />
            <BrandLogo variant="cream" className={styles.logoDark} />
          </span>
          <p className={styles.tagline}>Fikirden üretime, ürün sonrası desteğe kadar.</p>
        </div>

        <nav aria-labelledby="footer-sayfalar" className={styles.group}>
          <h2 id="footer-sayfalar" className={styles.groupTitle}>
            Sayfalar
          </h2>
          <ul className={styles.list}>
            {mainRoutes.map((route) => (
              <li key={route.href}>
                <NavLink href={route.href} className={styles.link}>
                  {route.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-hizmetler" className={styles.group}>
          <h2 id="footer-hizmetler" className={styles.groupTitle}>
            Hizmetlerimiz
          </h2>
          <ul className={styles.list}>
            <li>
              <NavLink href={servicesHref} className={styles.link}>
                Tüm hizmetler
              </NavLink>
            </li>
            {services.map((service) => (
              <li key={service.slug}>
                <NavLink href={serviceHref(service.slug)} className={styles.link}>
                  {service.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

      </div>

      <div className={`container ${styles.legal}`}>
        <p>
          © {year} {siteName}
        </p>
      </div>
    </footer>
  );
}
