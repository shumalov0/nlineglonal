import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'
import { ProductCard } from '@/components/shop/ProductCard'
import { FilterSidebar, type FilterGroup } from '@/components/shop/FilterSidebar'
import { SearchBar } from '@/components/shop/SearchBar'
import { SortSelect } from '@/components/shop/SortSelect'
import { Pagination } from '@/components/shop/Pagination'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: {
    q?: string
    category?: string
    minPrice?: string
    maxPrice?: string
    color?: string
    size?: string
    inStock?: string
    sort?: string
    page?: string
  }
}

const PAGE_SIZE = 24

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const categorySlugs = searchParams.category?.split(',').filter(Boolean) ?? []
  if (categorySlugs.length === 1) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlugs[0] },
      select: { name: true, description: true },
    })
    if (category) {
      return {
        title: category.name,
        description:
          category.description ?? `${category.name} kateqoriyasında məhsullar`,
      }
    }
  }
  if (searchParams.q) {
    return { title: `"${searchParams.q}" axtarış nəticələri` }
  }
  return {
    title: 'Bütün məhsullar',
    description: 'Geniş çeşid mebel və xırda detallar',
  }
}

function parseList(value: string | undefined): string[] {
  return value?.split(',').map((s) => s.trim()).filter(Boolean) ?? []
}

function buildOrderBy(
  sort: string | undefined
): Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case 'price_asc':
      return { basePrice: 'asc' }
    case 'price_desc':
      return { basePrice: 'desc' }
    case 'popular':
      return [{ isFeatured: 'desc' }, { createdAt: 'desc' }]
    case 'newest':
    default:
      return { createdAt: 'desc' }
  }
}

async function loadFilters(): Promise<FilterGroup[]> {
  const [categories, attributeTypes] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, slug: true },
    }),
    prisma.attributeType.findMany({
      where: { slug: { in: ['color', 'size'] } },
      include: { values: { orderBy: { sortOrder: 'asc' } } },
    }),
  ])

  const groups: FilterGroup[] = [
    {
      id: 'category',
      label: 'Kateqoriya',
      type: 'category',
      options: categories.map((c) => ({
        id: c.id,
        label: c.name,
        value: c.slug,
      })),
    },
  ]

  for (const type of attributeTypes) {
    groups.push({
      id: type.slug, // 'color', 'size'
      label: type.name,
      type: type.slug === 'color' ? 'color' : 'size',
      options: type.values.map((v) => ({
        id: v.id,
        label: v.value,
        value: v.value,
        colorCode: v.colorCode,
      })),
    })
  }

  return groups
}

async function loadProducts(searchParams: PageProps['searchParams']) {
  const page = Math.max(1, Number(searchParams.page ?? 1))
  const skip = (page - 1) * PAGE_SIZE

  const categories = parseList(searchParams.category)
  const colors = parseList(searchParams.color)
  const sizes = parseList(searchParams.size)
  const minPrice = searchParams.minPrice ? parseFloat(searchParams.minPrice) : null
  const maxPrice = searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : null

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(searchParams.q && {
      OR: [
        { name: { contains: searchParams.q, mode: 'insensitive' } },
        { shortDesc: { contains: searchParams.q, mode: 'insensitive' } },
        { tags: { has: searchParams.q.toLowerCase() } },
      ],
    }),
    ...(categories.length > 0 && {
      category: { slug: { in: categories } },
    }),
    ...(minPrice !== null && {
      basePrice: { gte: minPrice },
    }),
    ...(maxPrice !== null && {
      basePrice: minPrice !== null ? { gte: minPrice, lte: maxPrice } : { lte: maxPrice },
    }),
    ...(searchParams.inStock === 'true' && {
      OR: [
        { variants: { some: { stock: { gt: 0 }, isActive: true } } },
        { hasVariants: false },
      ],
    }),
    ...((colors.length > 0 || sizes.length > 0) && {
      variants: {
        some: {
          isActive: true,
          ...(colors.length > 0 && {
            attributes: { some: { value: { in: colors } } },
          }),
          ...(sizes.length > 0 && {
            attributes: { some: { value: { in: sizes } } },
          }),
        },
      },
    }),
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: buildOrderBy(searchParams.sort),
      skip,
      take: PAGE_SIZE,
      include: {
        category: { select: { name: true } },
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true, altText: true },
        },
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

export default async function ProductsPage({ searchParams }: PageProps) {
  const [filters, results] = await Promise.all([
    loadFilters(),
    loadProducts(searchParams),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-[var(--color-text)]">
          Bütün məhsullar
        </h1>
        <p className="text-[var(--color-muted)]">{results.total} məhsul tapıldı</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[16rem_1fr]">
        <div className="hidden lg:block">
          <FilterSidebar groups={filters} />
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 sm:max-w-md">
              <SearchBar />
            </div>
            <SortSelect />
          </div>

          {results.items.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-[var(--color-muted)]">
                Filtrlərə uyğun məhsul tapılmadı.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.items.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    shortDesc: p.shortDesc,
                    basePrice: p.basePrice.toString(),
                    salePrice: p.salePrice?.toString() ?? null,
                    category: p.category,
                    images: p.images,
                  }}
                />
              ))}
            </div>
          )}

          <Pagination currentPage={results.page} totalPages={results.totalPages} />
        </div>
      </div>
    </div>
  )
}
