import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { CategoryForm } from '../../_components/CategoryForm'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

export default async function EditCategoryPage({ params }: PageProps) {
  const [category, parents] = await Promise.all([
    prisma.category.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  if (!category) notFound()

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-[var(--color-text)]">
          Kateqoriyanı redaktə et
        </h2>
        <p className="text-[var(--color-muted)]">{category.name}</p>
      </div>
      <CategoryForm
        mode="edit"
        parents={parents}
        initial={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          imageUrl: category.imageUrl,
          imageKey: category.imageKey,
          parentId: category.parentId,
          sortOrder: category.sortOrder,
          isActive: category.isActive,
        }}
      />
    </div>
  )
}
