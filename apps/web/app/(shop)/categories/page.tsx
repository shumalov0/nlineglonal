import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

const getCategories = unstable_cache(
  async () =>
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        description: true,
        _count: { select: { products: { where: { isActive: true } } } },
        children: {
          where: { isActive: true },
          select: { id: true, name: true, slug: true },
        },
      },
    }),
  ['categories-page'],
  { revalidate: 600, tags: ['categories'] }
)

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-[var(--color-text)]">
        Kateqoriyalar
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">
        Kateqoriyalara görə məhsullara baxın.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/products?category=${c.slug}`}
            className="card overflow-hidden shadow-card transition-shadow hover:shadow-card-lg"
          >
            <div className="aspect-[16/9] bg-[var(--color-surface-2)]">
              {c.imageUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={c.imageUrl}
                  alt={c.name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="p-5">
              <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
                {c.name}
              </h2>
              {c.description && (
                <p className="mt-1 text-sm text-[var(--color-muted)] line-clamp-2">
                  {c.description}
                </p>
              )}
              <p className="mt-2 text-sm font-medium text-[var(--color-primary)]">
                {c._count.products} məhsul →
              </p>
              {c.children.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.children.slice(0, 5).map((sub) => (
                    <span
                      key={sub.id}
                      className="inline-flex rounded-full bg-[var(--color-surface)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]"
                    >
                      {sub.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
