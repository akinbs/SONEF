"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Navbar'ın üstünde durduğu hero'nun bittiği öğe (ana sayfada süreç bölümünün başı). */
const HERO_END_SELECTOR = "[data-hero-end]";
/**
 * Navbar'ın altına geldiğinde navbar'ı yine beyaza çeviren lacivert bantlar. Ana sayfa kapanış bandı
 * Blok 08'de kaldırıldığından şu an bu işareti taşıyan öğe yoktur; seçici yeni bir lacivert bant için durur.
 */
const LIGHT_ZONE_SELECTOR = "[data-navbar-light]";

/**
 * Navbar, altında lacivert bir bant durduğu sürece beyazdır (`data-tone="header"`):
 * hero'nun herhangi bir parçası görünürken ve `data-navbar-light` işaretli bir bant (ana
 * sayfanın kapanışı) navbar'ın alt kenarının altına denk geldiğinde. Diğer konumlarda lacivert
 * olur (`data-tone="dark"`). Hero'su olmayan sayfalarda ve JavaScript yokken navbar beyaz kalır.
 */
export function HeaderTone() {
  const pathname = usePathname();

  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    if (!header) return;
    const heroEnd = document.querySelector<HTMLElement>(HERO_END_SELECTOR);
    if (!heroEnd) {
      header.dataset.tone = "header";
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = header.getBoundingClientRect().bottom;
      const heroVisible = heroEnd.getBoundingClientRect().top > line;
      const overLightZone = Array.from(document.querySelectorAll<HTMLElement>(LIGHT_ZONE_SELECTOR)).some((zone) => {
        const rect = zone.getBoundingClientRect();
        return rect.top <= line && rect.bottom > line;
      });
      header.dataset.tone = heroVisible || overLightZone ? "header" : "dark";
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      header.dataset.tone = "header";
    };
  }, [pathname]);

  return null;
}
