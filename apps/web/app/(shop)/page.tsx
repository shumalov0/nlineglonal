import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'
import { Hero } from '@/components/shop/sections/Hero'
import { CategoryCircles } from '@/components/shop/sections/CategoryCircles'
import { FeaturedProducts } from '@/components/shop/sections/FeaturedProducts'
import { CategoryProductRow } from '@/components/shop/sections/CategoryProductRow'
import { StatsSection } from '@/components/shop/sections/StatsSection'
import { Newsletter } from '@/components/shop/sections/Newsletter'

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

async function getHomeData() {
  // Kök kateqoriyalar və alt kateqoriya id-ləri
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

  // Hər kök üçün (özü + alt kateqoriyalar) məhsul sayını hesabla
  const rootsWithCounts = await Promise.all(
    roots.map(async (r) => {
      const catIds = [r.id, ...r.children.map((c) => c.id)]
      const count = await prisma.product.count({
        where: { isActive: true, categoryId: { in: catIds } },
      })
      return { ...r, catIds, count }
    })
  )

  // Məhsulu olan kökləri sayına görə sırala
  const usableRoots = rootsWithCounts
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)

  // Müxtəliflik üçün ilk 4 fərqli kök kateqoriya
  const selectedRoots = usableRoots.slice(0, 4)

  const [latest, circleCategories, ...rootProducts] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: productSelect,
    }),
    Promise.resolve(
      usableRoots.slice(0, 6).map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        imageUrl: r.imageUrl,
      }))
    ),
    ...selectedRoots.map((r) =>
      prisma.product.findMany({
        where: { isActive: true, categoryId: { in: r.catIds } },
        orderBy: { createdAt: 'desc' },
        take: 4,
        select: productSelect,
      })
    ),
  ])

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
