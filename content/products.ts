/**
 * Ürün kataloğu. SONEF gerçek ürün listesini sağlayana kadar BOŞ kalır.
 *
 * - Ad, açıklama, görsel ve özellikler yalnızca SONEF'in verdiği bilgilerden girilir.
 * - Ana sayfa animasyonundaki ESP32 kartı SONEF ürünü değildir; buraya eklenmez.
 * - Fiyat, stok, sepet veya ödeme alanı yoktur; bu site bir mağaza değildir.
 *
 * Liste boşken `/urunlerimiz` ürün kartı göstermez, hizmetlere yönlendirir.
 */

export type ProductImage = {
  /** `public/` altındaki gerçek ürün görseli. */
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type Product = {
  /** Kalıcı kimlik; ileride ürün detay sayfası eklenirse URL'de kullanılır. */
  slug: string;
  name: string;
  /** Kartta görünen bir-iki cümlelik tanım. */
  summary: string;
  category?: string;
  image?: ProductImage;
  /** SONEF'in onayladığı özellikler; etiket/değer çiftleri. */
  highlights?: readonly { label: string; value: string }[];
};

export const products: readonly Product[] = [];
