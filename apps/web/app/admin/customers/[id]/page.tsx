import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ChevronRight, Mail, Phone, Calendar } from 'lucide-react'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

const dateFmt = new Intl.DateTimeFormat('az-AZ', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export default async function CustomerDetailPage({ params }: PageProps) {
  const customer = await prisma.user.findUnique({
    where: { id: params.id, role: 'CUSTOMER' },
    include: {
      addresses: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { _count: { select: { items: true } } },
      },
    },
  })

  if (!customer) notFound()

  // Statistikalar
  const totalSpent = customer.orders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + Number(o.total), 0)
  const lastOrder = customer.orders[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/customers">
          <Button variant="ghost" size="icon" aria-label="Geri">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h2 className="font-display text-2xl font-bold text-[var(--color-text)]">
            {customer.name ?? customer.email}
          </h2>
          <p className="text-sm text-[var(--color-muted)]">Müştəri detalı</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {/* Sifariş tarixçəsi */}
          <div className="card overflow-hidden shadow-card">
            <div className="border-b border-[var(--color-border-light)] px-5 py-3">
              <h3 className="font-medium text-[var(--color-text)]">
                Sifariş tarixçəsi ({customer.orders.length})
              </h3>
            </div>
            {customer.orders.length === 0 ? (
              <div className="py-10 text-center text-sm text-[var(--color-muted)]">
                Hələ sifariş yoxdur
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-surface-2)] text-left text-xs uppercase tracking-wider text-[var(--color-muted)]">
                  <tr>
                    <th className="px-4 py-2">№</th>
                    <th className="px-4 py-2">Tarix</th>
                    <th className="px-4 py-2 text-center">Element</th>
                    <th className="px-4 py-2 text-right">Cəm</th>
                    <th className="px-4 py-2 text-center">Status</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-light)]">
                  {customer.orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[var(--color-surface)]">
                      <td className="px-4 py-2.5 font-mono text-xs text-[var(--color-text)]">
                        #{order.orderNumber.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-2.5 text-[var(--color-text-secondary)]">
                        {dateFmt.format(order.createdAt)}
                      </td>
                      <td className="px-4 py-2.5 text-center text-[var(--color-text-secondary)]">
                        {order._count.items}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium text-[var(--color-text)]">
                        {formatPrice(order.total.toString())}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button size="sm" variant="ghost">
                            <ChevronRight size={14} />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          {/* Əlaqə */}
          <div className="card p-5 shadow-card space-y-3">
            <h3 className="font-medium text-[var(--color-text)]">Əlaqə</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                <Mail size={14} />
                <span className="break-all">{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  <Phone size={14} />
                  {customer.phone}
                </div>
              )}
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                <Calendar size={14} />
                Qoşulub: {dateFmt.format(customer.createdAt)}
              </div>
            </div>
          </div>

          {/* Statistika */}
          <div className="card p-5 shadow-card space-y-3">
            <h3 className="font-medium text-[var(--color-text)]">Statistika</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--color-muted)]">Sifariş sayı</dt>
                <dd className="font-medium text-[var(--color-text)]">
                  {customer.orders.length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-muted)]">Ödənilmiş cəm</dt>
                <dd className="font-medium text-[var(--color-text)]">
                  {formatPrice(totalSpent)}
                </dd>
              </div>
              {lastOrder && (
                <div className="flex justify-between">
                  <dt className="text-[var(--color-muted)]">Son sifariş</dt>
                  <dd className="text-[var(--color-text-secondary)]">
                    {dateFmt.format(lastOrder.createdAt)}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Ünvanlar */}
          {customer.addresses.length > 0 && (
            <div className="card p-5 shadow-card space-y-3">
              <h3 className="font-medium text-[var(--color-text)]">Ünvanlar</h3>
              <ul className="space-y-3 text-sm">
                {customer.addresses.slice(0, 3).map((addr) => (
                  <li
                    key={addr.id}
                    className="border-l-2 border-[var(--color-border-light)] pl-3"
                  >
                    <p className="font-medium text-[var(--color-text)]">
                      {addr.title}
                    </p>
                    <p className="text-[var(--color-text-secondary)]">{addr.fullName}</p>
                    <p className="text-[var(--color-text-secondary)]">{addr.street}</p>
                    <p className="text-[var(--color-text-secondary)]">
                      {addr.district}, {addr.city}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
