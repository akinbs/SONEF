import Image from "next/image";
import type { Product } from "@/content/products";
import styles from "./product-catalog.module.css";

/**
 * Gerçek ürün listesi için katalog ızgarası. Yalnızca `content/products.ts` dolu
 * olduğunda çağrılır; boş listeyle çağrılırsa hiçbir şey çizmez.
 */
export function ProductCatalog({ products }: { products: readonly Product[] }) {
  if (products.length === 0) return null;
  return (
    <ul className={styles.grid}>
      {products.map((product) => (
        <li key={product.slug}>
          <article className={styles.card} aria-labelledby={`urun-${product.slug}`} data-tone="card">
            {product.image ? (
              <div className={styles.media}>
                <Image
                  src={product.image.src}
                  alt={product.image.alt}
                  width={product.image.width}
                  height={product.image.height}
                  sizes="(min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 100vw"
                  className={styles.image}
                />
              </div>
            ) : null}
            <div className={styles.body}>
              {product.category ? <p className={styles.category}>{product.category}</p> : null}
              <h3 id={`urun-${product.slug}`} className={styles.name}>
                {product.name}
              </h3>
              <p className={styles.summary}>{product.summary}</p>
              {product.highlights?.length ? (
                <dl className={styles.highlights}>
                  {product.highlights.map((item) => (
                    <div key={item.label} className={styles.highlight}>
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
