/**
 * Yapılandırılmış veri (JSON-LD) betiği. `<` kaçışı, veri içindeki bir metnin
 * `</script>` ile betiği kapatmasını önler (Next.js JSON-LD kılavuzundaki öneri).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
