import Link from 'next/link'
import { ChevronRight, ShoppingBag } from 'lucide-react'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { getCurrentUser } from '@/lib/server-auth'
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from '@/components/admin/OrderStatusBadge'

export const dynamic = 'force-dynamic'

const dateFmt = new Intl.DateTimeFormat('az-AZ', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export default async function MyOrdersPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { items: true } } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">
          Sifarişlərim
        </h1>
        <p className="text-sm text-[var(--color-muted)]">{orders.length} sifariş</p>
      </div>

      {orders.length === 0 ? (
        <div className="card flex flex-col items-center justify-center p-12 text-center">
          <ShoppingBag size={48} className="text-[var(--color-muted)]" />
          <p className="mt-4 text-[var(--color-text)]">Hələ sifarişiniz yoxdur</p>
          <Link href="/products">
            <Button className="mt-4">Məhsullara bax</Button>
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden shadow-card">
          <ul className="divide-y divide-[var(--color-border-light)]">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}/success`}
                  className="flex items-center gap-3 px-5 py-4 text-sm hover:bg-[var(--color-surface)]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-[var(--color-muted)]">
                        #{order.orderNumber.slice(0, 8).toUpperCase()}
                      </span>
                      <OrderStatusBadge status={order.status} />
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </div>
                    <p className="mt-1 text-[var(--color-text)]">
                      {order._count.items} element •{' '}
                      <span className="text-[var(--color-muted)]">
                        {dateFmt.format(order.createdAt)}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[var(--color-text)]">
                      {formatPrice(order.total.toString())}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-[var(--color-muted)]" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
