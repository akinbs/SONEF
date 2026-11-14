/**
 * İletişim bağlantılarındaki dekoratif çizgi ikonlar (24×24, 1.5px çizgi, `currentColor`).
 * Anlamı her zaman yanındaki metin taşır; ikon ekran okuyuculardan gizlenir.
 */
export type ContactIconName = "phone" | "whatsapp" | "mail" | "instagram" | "map" | "clock";

const paths: Record<ContactIconName, React.ReactNode> = {
  phone: (
    <path d="M6.6 3.75h2.1l1.3 4.1-1.9 1.3a11 11 0 0 0 6.75 6.75l1.3-1.9 4.1 1.3v2.1a2 2 0 0 1-2.1 2 15.8 15.8 0 0 1-13.6-13.6 2 2 0 0 1 2-2.05Z" />
  ),
  // Konuşma balonu içinde telefon: WhatsApp'ı marka logosu kopyalanmadan anlatır.
  whatsapp: (
    <>
      <path d="M4.5 19.5l1.15-3.6A8.25 8.25 0 1 1 8.4 18.6Z" />
      <path d="M9.35 8.4h1.1l.6 1.75-.85.7a4.6 4.6 0 0 0 2.95 2.95l.7-.85 1.75.6v1.1a.95.95 0 0 1-1 .95 6.6 6.6 0 0 1-6.2-6.2.95.95 0 0 1 .95-1Z" />
    </>
  ),
  mail: (
    <>
      <rect x="3.25" y="5.25" width="17.5" height="13.5" rx="2" />
      <path d="m4 6.5 8 6.25 8-6.25" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="4.5" />
      <circle cx="12" cy="12" r="3.75" />
      <circle cx="16.9" cy="7.1" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  map: (
    <>
      <path d="M12 21s-6.75-5.6-6.75-11.25a6.75 6.75 0 0 1 13.5 0C18.75 15.4 12 21 12 21Z" />
      <circle cx="12" cy="9.75" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
};

export function ContactIcon({ name, className }: { name: ContactIconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}
