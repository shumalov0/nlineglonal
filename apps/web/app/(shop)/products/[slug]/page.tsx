import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronRight } from 'lucide-react'
import { prisma } from '@/lib/db'
import { ProductGallery } from '@/components/shop/ProductGallery'
import { VariantSelector } from '@/components/shop/VariantSelector'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { slug: string }
}

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      variants: {
        where: { isActive: true },
        include: {
          attributes: { include: { attributeType: true } },
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const product = await getProduct(params.slug)
  if (!product) return { title: 'Tapılmadı' }
  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDesc ?? product.shortDesc ?? undefined,
    openGraph: {
      title: product.name,
      description: product.shortDesc ?? undefined,
      images: product.images[0]?.url ? [product.images[0].url] : undefined,
    },
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  // Strukturlaşdırılmış data — JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDesc ?? product.description,
    sku: product.sku,
    image: product.images.map((i) => i.url),
    offers: {
      '@type': 'Offer',
      price: (product.salePrice ?? product.basePrice).toString(),
      priceCurrency: 'AZN',
      availability:
        product.variants.some((v) => v.stock > 0) || !product.hasVariants
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1 text-sm text-[var(--color-muted)]"
      >
        <Link href="/" className="hover:text-[var(--color-text)]">
          Ana səhifə
        </Link>
        <ChevronRight size={14} />
        <Link href="/products" className="hover:text-[var(--color-text)]">
          Məhsullar
        </Link>
        <ChevronRight size={14} />
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-[var(--color-text)]"
        >
          {product.category.name}
        </Link>
        <ChevronRight size={14} />
        <span className="text-[var(--color-text)] line-clamp-1">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductGallery
          images={product.images.map((i) => ({ url: i.url, altText: i.altText }))}
          productName={product.name}
        />

        <div className="space-y-6">
          <div>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)]"
            >
              {product.category.name}
            </Link>
            <h1 className="mt-2 font-display text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
              {product.name}
            </h1>
            {product.shortDesc && (
              <p className="mt-3 text-[var(--color-text-secondary)]">
                {product.shortDesc}
              </p>
            )}
          </div>

          <VariantSelector
            productId={product.id}
            basePrice={product.basePrice.toString()}
            salePrice={product.salePrice?.toString() ?? null}
            hasVariants={product.hasVariants}
            variants={product.variants}
          />

          {product.description && (
            <div className="border-t border-[var(--color-border-light)] pt-6">
              <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
                Təsvir
              </h2>
              <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {product.description}
              </div>
            </div>
          )}

          {(product.material || product.weight) && (
            <div className="border-t border-[var(--color-border-light)] pt-6">
              <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
                Xüsusiyyətlər
              </h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--color-muted)]">SKU</dt>
                  <dd className="font-mono text-[var(--color-text)]">{product.sku}</dd>
                </div>
                {product.material && (
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-muted)]">Material</dt>
                    <dd className="text-[var(--color-text)]">{product.material}</dd>
                  </div>
                )}
                {product.weight && (
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-muted)]">Çəki</dt>
                    <dd className="text-[var(--color-text)]">{product.weight} kq</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  )
}
