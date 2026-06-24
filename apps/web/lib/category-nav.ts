// Naviqasiya üçün kateqoriya ağacı
import { prisma } from './db'

export interface NavCategory {
  id: string
  name: string
  slug: string
  productCount: number
  children: { id: string; name: string; slug: string }[]
}

export async function getCategoryNav(): Promise<NavCategory[]> {
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
}
