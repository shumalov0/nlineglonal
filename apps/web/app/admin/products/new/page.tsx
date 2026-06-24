import { prisma } from '@/lib/db'
import Link from 'next/link'
import { ProductForm } from '../_components/ProductForm'

export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-[var(--color-text)]">
          Yeni məhsul
        </h2>
        <p className="text-[var(--color-muted)]">
          Əsas məlumatları doldurun. Yaradıldıqdan sonra variant əlavə edə bilərsiniz.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="card p-6 shadow-card">
          <p className="text-sm text-[var(--color-text)]">
            Əvvəlcə ən azı bir kateqoriya yaratmalısınız.
          </p>
          <Link
            href="/admin/categories/new"
            className="mt-3 inline-block text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            Kateqoriya yarat →
          </Link>
        </div>
      ) : (
        <ProductForm mode="create" categories={categories} />
      )}
    </div>
  )
}
