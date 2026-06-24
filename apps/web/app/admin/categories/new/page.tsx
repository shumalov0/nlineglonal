import { prisma } from '@/lib/db'
import { CategoryForm } from '../_components/CategoryForm'

export const dynamic = 'force-dynamic'

export default async function NewCategoryPage() {
  const parents = await prisma.category.findMany({
    where: { parentId: null },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-[var(--color-text)]">
          Yeni kateqoriya
        </h2>
        <p className="text-[var(--color-muted)]">
          Kateqoriya yarat və ya alt kateqoriya əlavə et.
        </p>
      </div>
      <CategoryForm mode="create" parents={parents} />
    </div>
  )
}
