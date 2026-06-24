import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'

interface ProductCardData {
  id: string
  name: string
  slug: string
  shortDesc: string | null
  basePrice: string
  salePrice: string | null
  category: { name: string }
  images: { url: string; altText: string | null }[]
}

interface Props {
  product: ProductCardData
}

export function ProductCard({ product }: Props) {
  const price = parseFloat(product.salePrice ?? product.basePrice)
  const original = product.salePrice ? parseFloat(product.basePrice) : null
  const img = product.images[0]
  const discount =
    original && original > price
      ? Math.round(((original - price) / original) * 100)
      : null

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      {/* Şəkil */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--color-surface-2)]">
        {img ? (
          <Image
            src={img.url}
            alt={img.altText ?? product.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="img-zoom object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--color-muted)]">
            Şəkil yoxdur
          </div>
        )}

        {discount && (
          <span className="absolute left-3 top-3 rounded-full bg-[var(--color-text)] px-3 py-1 text-xs font-semibold text-[var(--color-bg)]">
            -{discount}%
          </span>
        )}
      </div>

      {/* Məlumat */}
      <div className="mt-4">
        <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
          {product.category.name}
        </p>
        <h3 className="mt-1 font-display text-base font-medium text-[var(--color-text)] line-clamp-1 group-hover:text-[var(--color-primary)]">
          {product.name}
        </h3>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-display text-lg font-semibold text-[var(--color-text)]">
            {formatPrice(price)}
          </span>
          {original && (
            <span className="text-sm text-[var(--color-muted)] line-through">
              {formatPrice(original)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
