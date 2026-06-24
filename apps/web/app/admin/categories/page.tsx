import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/Button'
import { Plus, Pencil } from 'lucide-react'
import { DeleteCategoryButton } from './_components/DeleteCategoryButton'

export const dynamic = 'force-dynamic'

async function getCategories() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { products: true, children: true } },
    },
  })
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-[var(--color-text)]">
            Kateqoriyalar
          </h2>
          <p className="text-[var(--color-muted)]">
            {categories.length} kateqoriya
          </p>
        </div>
        <Link href="/admin/categories/new">
          <Button>
            <Plus size={16} /> Yeni kateqoriya
          </Button>
        </Link>
      </div>

      <div className="card overflow-hidden shadow-card">
        <table className="w-full">
          <thead className="bg-[var(--color-surface-2)] text-left text-xs uppercase tracking-wider text-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-3">Ad</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Parent</th>
              <th className="px-4 py-3 text-center">Məhsul</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Əməliyyat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-light)] text-sm">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[var(--color-muted)]">
                  Hələ kateqoriya yoxdur
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--color-surface)]">
                  <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                    {c.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--color-muted)]">
                    {c.slug}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {c.parent?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-[var(--color-text-secondary)]">
                    {c._count.products}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={
                        c.isActive
                          ? 'inline-flex rounded-full px-2 py-0.5 text-xs bg-[var(--color-success-light)] text-[var(--color-success)]'
                          : 'inline-flex rounded-full px-2 py-0.5 text-xs bg-[var(--color-error-light)] text-[var(--color-error)]'
                      }
                    >
                      {c.isActive ? 'Aktiv' : 'Deaktiv'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/categories/${c.id}/edit`}>
                        <Button size="sm" variant="ghost">
                          <Pencil size={14} />
                        </Button>
                      </Link>
                      <DeleteCategoryButton id={c.id} name={c.name} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
