import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'
import { Hero } from '@/components/shop/sections/Hero'
import { CategoryCircles } from '@/components/shop/sections/CategoryCircles'
import { FeaturedProducts } from '@/components/shop/sections/FeaturedProducts'
import { CategoryProductRow } from '@/components/shop/sections/CategoryProductRow'
import { StatsSection } from '@/components/shop/sections/StatsSection'
import { Newsletter } from '@/components/shop/sections/Newsletter'

// Səhifə dinamikdir (build zamanı DB-yə vurmur), amma data unstable_cache ilə
// 10 dəqiqə cache olunur — ziyarətlər arası DB transfer minimuma düşür
export const dynamic = 'force-dynamic'

const productSelect = {
  id: true,
  name: true,
  slug: true,
  shortDesc: true,
  basePrice: true,
  salePrice: true,
  category: { select: { name: true } },
  images: {
    where: { isPrimary: true },
    take: 1,
    select: { url: true, altText: true },
  },
} satisfies Prisma.ProductSelect

function serialize(p: {
  id: string
  name: string
  slug: string
  shortDesc: string | null
  basePrice: Prisma.Decimal
  salePrice: Prisma.Decimal | null
  category: { name: string }
  images: { url: string; altText: string | null }[]
}) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    shortDesc: p.shortDesc,
    basePrice: p.basePrice.toString(),
    salePrice: p.salePrice?.toString() ?? null,
    category: p.category,
    images: p.images,
  }
}

const getHomeData = unstable_cache(
  _getHomeData,
  ['home-data'],
  { revalidate: 600, tags: ['products', 'categories'] }
)

async function _getHomeData() {
  // 1) Kök kateqoriyalar + alt kateqoriya id-ləri (tək sorğu)
  const roots = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      children: { where: { isActive: true }, select: { id: true } },
    },
  })

  // 2) Məhsul saylarını kateqoriya üzrə TƏK groupBy ilə al (paralel count əvəzinə)
  const grouped = await prisma.product.groupBy({
    by: ['categoryId'],
    where: { isActive: true },
    _count: { _all: true },
  })
  const countByCat = new Map<string, number>()
  for (const g of grouped) {
    countByCat.set(g.categoryId, g._count._all)
  }

  // 3) Hər kök üçün (özü + alt) sayı JS-də hesabla
  const rootsWithCounts = roots.map((r) => {
    const catIds = [r.id, ...r.children.map((c) => c.id)]
    const count = catIds.reduce((sum, id) => sum + (countByCat.get(id) ?? 0), 0)
    return { ...r, catIds, count }
  })

  const usableRoots = rootsWithCounts
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)

  const selectedRoots = usableRoots.slice(0, 4)

  // 4) Məhsul sorğuları (kiçik paralel batch — 5 sorğu)
  const [latest, ...rootProducts] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: productSelect,
    }),
    ...selectedRoots.map((r) =>
      prisma.product.findMany({
        where: { isActive: true, categoryId: { in: r.catIds } },
        orderBy: { createdAt: 'desc' },
        take: 4,
        select: productSelect,
      })
    ),
  ])

  const circleCategories = usableRoots.slice(0, 6).map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    imageUrl: r.imageUrl,
  }))

  return {
    latest: latest.map(serialize),
    circleCategories,
    sections: selectedRoots.map((r, i) => ({
      category: { id: r.id, name: r.name, slug: r.slug },
      products: (rootProducts[i] ?? []).map(serialize),
    })),
  }
}

export default async function HomePage() {
  const { latest, circleCategories, sections } = await getHomeData()

  return (
    <>
      <Hero />
      <CategoryCircles categories={circleCategories} />

      {/* Yeni məhsullar */}
      <FeaturedProducts products={latest} />

      {/* İlk top kateqoriya */}
      {sections[0] && (
        <CategoryProductRow
          title={sections[0].category.name}
          categorySlug={sections[0].category.slug}
          products={sections[0].products}
        />
      )}

      <StatsSection />

      {/* Qalan top kateqoriyalar */}
      {sections.slice(1).map((s) => (
        <CategoryProductRow
          key={s.category.id}
          title={s.category.name}
          categorySlug={s.category.slug}
          products={s.products}
        />
      ))}

      <Newsletter />
    </>
  )
}
