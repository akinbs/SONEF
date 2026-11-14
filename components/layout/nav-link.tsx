"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

type NavLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/**
 * Etkin sayfayı `aria-current="page"` ile, alt sayfasında bulunulan bölümü
 * (ör. /hizmetler/smd-dizgi iken "Hizmetler") `aria-current="true"` ile işaretler.
 */
export function NavLink({ href, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const current = pathname === href ? "page" : href !== "/" && pathname.startsWith(`${href}/`) ? "true" : undefined;
  return <Link href={href} aria-current={current} {...props} />;
}
