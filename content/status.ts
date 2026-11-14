/**
 * İçeriğin doğrulama durumu. Yalnızca geliştirici içindir; ziyaretçi arayüzünde
 * gösterilmez. Ayrıntılı liste: `docs/icerik-durumu.md`.
 *
 * - verified: SONEF tarafından bildirilen bilgi
 * - draft: SONEF bilgilerinden hazırlanmış, firma sahibinin onayını bekleyen metin
 * - missing: henüz sağlanmamış; sayfa bu alan olmadan çalışır
 */
export type ContentStatus = "verified" | "draft" | "missing";
