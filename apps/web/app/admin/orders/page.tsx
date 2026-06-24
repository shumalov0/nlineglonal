import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/admin/OrderStatusBadge'
import { OrderFilters } from './_components/OrderFilters'
import { Pagination } from '@/components/shop/Pagination'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: {
    q?: string
    status?: string
    paymentStatus?: string
    from?: string
    to?: string
    page?: string
  }
}

const PAGE_SIZE = 20

async function loadOrders(searchParams: PageProps['searchParams']) {
  const page = Math.max(1, Number(searchParams.page ?? 1))

  const where: Prisma.OrderWhereInput = {
    ...(searchParams.status && {
      status: searchParams.status as Prisma.EnumOrderStatusFilter['equals'],
    }),
    ...(searchParams.paymentStatus && {
      paymentStatus: searchParams.paymentStatus as Prisma.EnumPaymentStatusFilter['equals'],
    }),
    ...(searchParams.q && {
      OR: [
        { orderNumber: { contains: searchParams.q, mode: 'insensitive' } },
        { guestName: { contains: searchParams.q, mode: 'insensitive' } },
        { guestEmail: { contains: searchParams.q, mode: 'insensitive' } },
        { user: { email: { contains: searchParams.q, mode: 'insensitive' } } },
        { user: { name: { contains: searchParams.q, mode: 'insensitive' } } },
      ],
    }),
    ...((searchParams.from || searchParams.to) && {
      createdAt: {
        ...(searchParams.from && { gte: new Date(searchParams.from) }),
        ...(searchParams.to && { lte: new Date(`${searchParams.to}T23:59:59`) }),
      },
    }),
  }

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
  ])

  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  }
}

const dateFmt = new Intl.DateTimeFormat('az-AZ', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const results = await loadOrders(searchParams)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-[var(--color-text)]">
          Sifarişlər
        </h2>
        <p className="text-[var(--color-muted)]">{results.total} sifariş</p>
      </div>

      <OrderFilters />

      <div className="card overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--color-surface-2)] text-left text-xs uppercase tracking-wider text-[var(--color-muted)]">
              <tr>
                <th className="px-4 py-3">№</th>
                <th className="px-4 py-3">Müştəri</th>
                <th className="px-4 py-3">Tarix</th>
                <th className="px-4 py-3 text-center">Element</th>
                <th className="px-4 py-3 text-right">Cəm</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Ödəniş</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-light)] text-sm">
              {results.items.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-[var(--color-muted)]"
                  >
                    Filtrlərə uyğun sifariş tapılmadı
                  </td>
                </tr>
              ) : (
                results.items.map((order) => {
                  const customerName =
                    order.user?.name ?? order.guestName ?? '—'
                  const customerEmail =
                    order.user?.email ?? order.guestEmail ?? '—'
                  return (
                    <tr key={order.id} className="hover:bg-[var(--color-surface)]">
                      <td className="px-4 py-3 font-mono text-xs font-medium text-[var(--color-text)]">
                        #{order.orderNumber.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[var(--color-text)]">{customerName}</div>
                        <div className="text-xs text-[var(--color-muted)]">
                          {customerEmail}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {dateFmt.format(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-center text-[var(--color-text-secondary)]">
                        {order._count.items}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[var(--color-text)]">
                        {formatPrice(order.total.toString())}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button size="sm" variant="ghost">
                            <ChevronRight size={16} />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={results.page}
        totalPages={results.totalPages}
        basePath="/admin/orders"
      />
    </div>
  )
}
