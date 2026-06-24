import Link from 'next/link'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/Button'
import { Plus, Pencil } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { DeleteProductButton } from './_components/DeleteProductButton'
import { ProductFilters } from './_components/ProductFilters'
import { Pagination } from '@/components/shop/Pagination'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: {
    q?: string
    categoryId?: string
    status?: string
    page?: string
  }
}

const PAGE_SIZE = 30

async function loadProducts(searchParams: PageProps['searchParams']) {
  const page = Math.max(1, Number(searchParams.page ?? 1))

  const where: Prisma.ProductWhereInput = {
    ...(searchParams.q && {
      OR: [
        { name: { contains: searchParams.q, mode: 'insensitive' } },
        { sku: { contains: searchParams.q, mode: 'insensitive' } },
      ],
    }),
    ...(searchParams.categoryId && { categoryId: searchParams.categoryId }),
    ...(searchParams.status === 'active' && { isActive: true }),
    ...(searchParams.status === 'inactive' && { isActive: false }),
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        category: { select: { name: true } },
        images: { where: { isPrimary: true }, take: 1 },
        _count: { select: { variants: true } },
      },
    }),
    prisma.product.count({ where }),
  ])

  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  }
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const [results, categories] = await Promise.all([
    loadProducts(searchParams),
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-[var(--color-text)]">
            Məhsullar
          </h2>
          <p className="text-[var(--color-muted)]">{results.total} məhsul</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus size={16} /> Yeni məhsul
          </Button>
        </Link>
      </div>

      <ProductFilters categories={categories} />

      <div className="card overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--color-surface-2)] text-left text-xs uppercase tracking-wider text-[var(--color-muted)]">
              <tr>
                <th className="px-4 py-3">Məhsul</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Kateqoriya</th>
                <th className="px-4 py-3 text-right">Qiymət</th>
                <th className="px-4 py-3 text-center">Variant</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-light)] text-sm">
              {results.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[var(--color-muted)]">
                    Məhsul tapılmadı
                  </td>
                </tr>
              ) : (
                results.items.map((p) => {
                  const img = p.images[0]
                  return (
                    <tr key={p.id} className="hover:bg-[var(--color-surface)]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-[var(--color-surface-2)]">
                            {img && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={img.url} alt={img.altText ?? p.name} className="h-full w-full object-cover" />
                            )}
                          </div>
                          <span className="font-medium text-[var(--color-text)] line-clamp-1 max-w-xs">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--color-muted)]">{p.sku}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{p.category.name}</td>
                      <td className="px-4 py-3 text-right text-[var(--color-text)]">
                        {formatPrice(p.basePrice.toString())}
                      </td>
                      <td className="px-4 py-3 text-center text-[var(--color-text-secondary)]">
                        {p._count.variants}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={
                            p.isActive
                              ? 'inline-flex rounded-full px-2 py-0.5 text-xs bg-[var(--color-success-light)] text-[var(--color-success)]'
                              : 'inline-flex rounded-full px-2 py-0.5 text-xs bg-[var(--color-error-light)] text-[var(--color-error)]'
                          }
                        >
                          {p.isActive ? 'Aktiv' : 'Deaktiv'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/products/${p.id}/edit`}>
                            <Button size="sm" variant="ghost">
                              <Pencil size={14} />
                            </Button>
                          </Link>
                          <DeleteProductButton id={p.id} name={p.name} />
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={results.page}
        totalPages={results.totalPages}
        basePath="/admin/products"
      />
    </div>
  )
}
