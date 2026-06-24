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
  title: string
  categorySlug: string
  products: Product[]
}

export function CategoryProductRow({ title, categorySlug, products }: Props) {
  if (products.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="flex items-end justify-between">
        <h2 className="font-display text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
          {title}
        </h2>
        <Link
          href={`/products?category=${categorySlug}`}
          className="group inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
        >
          Hamısı
          <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
      <div className="mt-6 grid gap-x-5 gap-y-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
