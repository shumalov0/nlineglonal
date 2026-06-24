import Link from 'next/link'
import type { Prisma } from '@prisma/client'
import { ChevronRight } from 'lucide-react'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/shop/Pagination'
import { CustomersFilter } from './_components/CustomersFilter'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: { q?: string; page?: string }
}

const PAGE_SIZE = 20

const dateFmt = new Intl.DateTimeFormat('az-AZ', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

async function loadCustomers(searchParams: PageProps['searchParams']) {
  const page = Math.max(1, Number(searchParams.page ?? 1))

  const where: Prisma.UserWhereInput = {
    role: 'CUSTOMER',
    ...(searchParams.q && {
      OR: [
        { name: { contains: searchParams.q, mode: 'insensitive' } },
        { email: { contains: searchParams.q, mode: 'insensitive' } },
        { phone: { contains: searchParams.q, mode: 'insensitive' } },
      ],
    }),
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ])

  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  }
}

export default async function AdminCustomersPage({ searchParams }: PageProps) {
  const results = await loadCustomers(searchParams)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-[var(--color-text)]">
          Müştərilər
        </h2>
        <p className="text-[var(--color-muted)]">{results.total} müştəri</p>
      </div>

      <CustomersFilter />

      <div className="card overflow-hidden shadow-card">
        <table className="w-full">
          <thead className="bg-[var(--color-surface-2)] text-left text-xs uppercase tracking-wider text-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-3">Ad</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Telefon</th>
              <th className="px-4 py-3 text-center">Sifariş</th>
              <th className="px-4 py-3">Qoşulma</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-light)] text-sm">
            {results.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[var(--color-muted)]">
                  Müştəri tapılmadı
                </td>
              </tr>
            ) : (
              results.items.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--color-surface)]">
                  <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                    {c.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {c.email}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {c.phone ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-[var(--color-text-secondary)]">
                    {c._count.orders}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {dateFmt.format(c.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/customers/${c.id}`}>
                      <Button size="sm" variant="ghost">
                        <ChevronRight size={16} />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={results.page}
        totalPages={results.totalPages}
        basePath="/admin/customers"
      />
    </div>
  )
}
