import type { ContentStatus } from "./status";

/**
 * İletişim bilgilerinin tek kaynağı (Blok 08, SONEF Teknoloji'nin verdiği bilgiler).
 *
 * İletişim sayfası, footer ve Organization yapılandırılmış verisi buradan okur. Görünen telefon
 * biçimi (`display`) ile arama bağlantısının değeri (`international`, E.164) ayrı tutulur.
 * Boş ya da geçersiz bir alan bağlantıya dönüştürülmez (boş `tel:`/`mailto:` veya `href="#"` yoktur).
 */

export type PhoneNumber = {
  /** Ziyaretçinin gördüğü biçim, ör. "0534 056 74 68". */
  display: string;
  /** `tel:` ve WhatsApp bağlantısı için uluslararası biçim, ör. "+905340567468". */
  international: string;
};

export type ContactPerson = {
  id: string;
  name: string;
  phone: PhoneNumber;
  /** true ise bu numaraya WhatsApp bağlantısı da gösterilir. */
  whatsapp?: boolean;
};

export type SocialPlatform = "instagram" | "facebook" | "tiktok";

export type SocialProfile = {
  platform: SocialPlatform;
  /** Platform adı, ör. "Instagram". */
  label: string;
  /** Görünen kullanıcı adı, ör. "@sonefteknoloji". */
  handle: string;
  /** Profilin https adresi. */
  url: string;
};

export type WorkingHoursRow = {
  /** Görünen gün aralığı, ör. "Pazartesi–Cuma". */
  days: string;
  /** Görünen saat aralığı, ör. "08.00–18.00". */
  hours: string;
  /** schema.org `dayOfWeek` değerleri. */
  schemaDays: readonly ("Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday")[];
  /** schema.org için 24 saat biçimi ("08:00"). */
  opens: string;
  closes: string;
};

export type ContactInfo = {
  status: ContentStatus;
  brandName: string;
  email: string;
  people: readonly ContactPerson[];
  address: {
    /** Görünen satırlar (her biri ayrı satırda gösterilir). */
    lines: readonly string[];
    /** schema.org PostalAddress alanları; görünen adresle aynı bilgiler. */
    street: string;
    district: string;
    postalCode: string;
    locality: string;
    region: string;
    country: "TR";
    /** Kullanıcının verdiği Google Haritalar bağlantısı. */
    mapUrl: string;
  };
  workingHours: readonly WorkingHoursRow[];
  /** Facebook ve TikTok bağlantıları sağlandığında bu listeye eklenir; sayfa ve footer kendiliğinden gösterir. */
  social: readonly SocialProfile[];
};

export const contactInfo: ContactInfo = {
  status: "verified",
  brandName: "SONEF Teknoloji",
  email: "sonefiletisim@gmail.com",
  people: [
    { id: "akin-bas", name: "Akın Baş", phone: { display: "0534 056 74 68", international: "+905340567468" }, whatsapp: true },
    { id: "mustafa-tasdemir", name: "Mustafa Taşdemir", phone: { display: "0530 844 23 83", international: "+905308442383" } },
  ],
  address: {
    lines: ["Küçükbakkalköy, Tevfik Fikret Cd.", "34750 Ataşehir / İstanbul"],
    street: "Küçükbakkalköy, Tevfik Fikret Cd.",
    district: "Ataşehir",
    postalCode: "34750",
    locality: "Ataşehir",
    region: "İstanbul",
    country: "TR",
    mapUrl:
      "https://www.google.com/maps/place//data=!4m2!3m1!1s0x14cac63e83de44ef:0x8de890cfe18641a3?sa=X&ved=1t:8290&ictx=111",
  },
  workingHours: [
    {
      days: "Pazartesi–Cuma",
      hours: "08.00–18.00",
      schemaDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
    { days: "Cumartesi", hours: "10.00–13.00", schemaDays: ["Saturday"], opens: "10:00", closes: "13:00" },
    { days: "Pazar", hours: "10.00–13.00", schemaDays: ["Sunday"], opens: "10:00", closes: "13:00" },
  ],
  social: [
    { platform: "instagram", label: "Instagram", handle: "@sonefteknoloji", url: "https://www.instagram.com/sonefteknoloji/" },
  ],
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INTERNATIONAL_PHONE = /^\+[1-9]\d{6,14}$/;

/** Yalnızca https adreslerini kabul eder; aksi halde bağlantı üretilmez. */
export function httpsUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

/** Geçerli e-posta için `mailto:` bağlantısı. */
export function mailtoHref(email: string): string | undefined {
  const value = email.trim();
  return EMAIL.test(value) ? `mailto:${value}` : undefined;
}

/** Geçerli uluslararası numara için `tel:` bağlantısı. */
export function telHref(phone: PhoneNumber): string | undefined {
  return INTERNATIONAL_PHONE.test(phone.international) ? `tel:${phone.international}` : undefined;
}

/** WhatsApp sohbet bağlantısı (`wa.me` numarayı + işareti olmadan bekler). */
export function whatsappHref(phone: PhoneNumber): string | undefined {
  return INTERNATIONAL_PHONE.test(phone.international) ? `https://wa.me/${phone.international.slice(1)}` : undefined;
}

/** Geçerli https adresi olan sosyal profiller. */
export function getSocialProfiles(info: ContactInfo = contactInfo): SocialProfile[] {
  return info.social.filter((profile) => httpsUrl(profile.url) && profile.label.trim());
}
