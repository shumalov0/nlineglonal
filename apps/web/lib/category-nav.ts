// Naviqasiya üçün kateqoriya ağacı
import { unstable_cache } from 'next/cache'
import { prisma } from './db'

export interface NavCategory {
  id: string
  name: string
  slug: string
  productCount: number
  children: { id: string; name: string; slug: string }[]
}

// 10 dəqiqə cache — hər request-də DB-yə vurmamaq üçün (Neon transfer qənaəti)
export const getCategoryNav = unstable_cache(
  async (): Promise<NavCategory[]> => {
    try {
      const cats = await prisma.category.findMany({
        where: { isActive: true, parentId: null },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { products: { where: { isActive: true } } } },
          children: {
            where: { isActive: true },
            orderBy: { name: 'asc' },
            select: { id: true, name: true, slug: true },
          },
        },
      })
      return cats.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        productCount: c._count.products,
        children: c.children,
      }))
    } catch {
      return []
    }
  },
  ['category-nav'],
  { revalidate: 600, tags: ['categories'] }
)
