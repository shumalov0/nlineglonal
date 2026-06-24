import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { ProductCard } from '@/components/shop/ProductCard'

interface Product {
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
  products: Product[]
}

export function FeaturedProducts({ products }: Props) {
  if (products.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-luxe text-[var(--color-primary)]">
            <span className="h-px w-10 bg-[var(--color-primary)]" />
            Yeni gələnlər
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl">
            Ən son məhsullar
          </h2>
        </div>
        <Link
          href="/products"
          className="group inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
        >
          Hamısını gör
          <ArrowUpRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>

      <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
