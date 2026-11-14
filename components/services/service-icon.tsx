import type { ServiceIconName } from "@/content/services";

/**
 * Hizmet kartlarındaki dekoratif çizgi ikonlar (24×24, 1.5px çizgi, renk `currentColor`).
 * Anlamı kart başlığı taşır; ikon ekran okuyuculardan gizlenir.
 */
const paths: Record<ServiceIconName, React.ReactNode> = {
  // SMD dizgi: yerleştirme ucu bir komponenti karta indiriyor.
  smd: (
    <>
      <path d="M12 2.75v4" />
      <path d="M10.25 6.75h3.5L13 9h-2z" />
      <rect x="7.25" y="11.5" width="9.5" height="6" rx="1" />
      <path d="M9.5 17.5v2M12 17.5v2M14.5 17.5v2" />
      <path d="M3.75 21.25h16.5" />
    </>
  ),
  // PCB: kart, iletken yollar ve vialar.
  pcb: (
    <>
      <rect x="3.25" y="4.25" width="17.5" height="15.5" rx="2" />
      <path d="M7.5 8.75h4l2 2.5h2.25" />
      <path d="M7.5 15.25h3.25l2-2" />
      <circle cx="17" cy="11.25" r="1.25" />
      <circle cx="14" cy="15.25" r="1.25" />
    </>
  ),
  // Komponent: makara üzerinde şerit komponent.
  component: (
    <>
      <circle cx="11" cy="11" r="7.75" />
      <circle cx="11" cy="11" r="2.25" />
      <path d="M11 3.25v5.5M4.3 14.9l4.75-2.75M17.7 14.9l-4.75-2.75" />
      <path d="M11 18.75h9.75" />
      <path d="M15.5 18.75v2M18.5 18.75v2" />
    </>
  ),
};

export function ServiceIcon({ name, className }: { name: ServiceIconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
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
