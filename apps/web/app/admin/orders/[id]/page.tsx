import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, FileText, User as UserIcon, MapPin } from 'lucide-react'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from '@/components/admin/OrderStatusBadge'
import { OrderStatusEditor } from './_components/OrderStatusEditor'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

const dateFmt = new Intl.DateTimeFormat('az-AZ', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      address: true,
      items: true,
    },
  })

  if (!order) notFound()

  const customerName =
    order.user?.name ?? order.guestName ?? 'Qonaq'
  const customerEmail =
    order.user?.email ?? order.guestEmail ?? '—'
  const customerPhone = order.guestPhone ?? '—'

  return (
    <div className="space-y-6">
      {/* Geri + başlıq */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="ghost" size="icon" aria-label="Geri">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h2 className="font-display text-2xl font-bold text-[var(--color-text)]">
              Sifariş #{order.orderNumber.slice(0, 8).toUpperCase()}
            </h2>
            <p className="text-sm text-[var(--color-muted)]">
              {dateFmt.format(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
          <Link href={`/admin/orders/${order.id}/invoice`} target="_blank">
            <Button variant="secondary" size="sm">
              <FileText size={14} /> Faktura
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {/* Item-lər */}
          <div className="card overflow-hidden shadow-card">
            <div className="px-5 py-3 border-b border-[var(--color-border-light)]">
              <h3 className="font-medium text-[var(--color-text)]">
                Məhsullar ({order.items.length})
              </h3>
            </div>
            <div className="divide-y divide-[var(--color-border-light)]">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-5">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--color-surface-2)]">
                    {item.imageUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[var(--color-text)] line-clamp-2">
                      {item.name}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-[var(--color-muted)]">
                      {item.sku}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[var(--color-text)]">
                      {formatPrice(item.total.toString())}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {item.quantity} × {formatPrice(item.price.toString())}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Xülasə */}
            <div className="border-t border-[var(--color-border-light)] bg-[var(--color-surface)] px-5 py-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">Ara cəm</span>
                <span className="text-[var(--color-text)]">
                  {formatPrice(order.subtotal.toString())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">Çatdırılma</span>
                <span className="text-[var(--color-text)]">
                  {formatPrice(order.shippingCost.toString())}
                </span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Endirim</span>
                  <span className="text-[var(--color-text)]">
                    -{formatPrice(order.discountAmount.toString())}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-[var(--color-border-light)] pt-2 mt-2">
                <span className="font-medium text-[var(--color-text)]">Cəm</span>
                <span className="font-display text-lg font-bold text-[var(--color-primary)]">
                  {formatPrice(order.total.toString())}
                </span>
              </div>
            </div>
          </div>

          {/* Müştəri qeydi */}
          {order.notes && (
            <div className="card p-5 shadow-card">
              <h3 className="font-medium text-[var(--color-text)]">Daxili qeyd</h3>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)] whitespace-pre-line">
                {order.notes}
              </p>
            </div>
          )}
        </div>

        {/* Yan panel */}
        <aside className="space-y-6">
          {/* Müştəri məlumatları */}
          <div className="card p-5 shadow-card space-y-3">
            <div className="flex items-center gap-2">
              <UserIcon size={18} className="text-[var(--color-muted)]" />
              <h3 className="font-medium text-[var(--color-text)]">Müştəri</h3>
            </div>
            <dl className="space-y-1.5 text-sm">
              <div>
                <dt className="text-[var(--color-muted)]">Ad</dt>
                <dd className="text-[var(--color-text)]">{customerName}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted)]">Email</dt>
                <dd className="text-[var(--color-text)] break-all">
                  {customerEmail}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted)]">Telefon</dt>
                <dd className="text-[var(--color-text)]">
                  {order.user ? '—' : customerPhone}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted)]">Növ</dt>
                <dd className="text-[var(--color-text)]">
                  {order.user ? 'Qeydiyyatdan keçib' : 'Qonaq'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Çatdırılma ünvanı */}
          {order.address && (
            <div className="card p-5 shadow-card space-y-3">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-[var(--color-muted)]" />
                <h3 className="font-medium text-[var(--color-text)]">
                  Çatdırılma ünvanı
                </h3>
              </div>
              <div className="text-sm text-[var(--color-text)] space-y-0.5">
                <p className="font-medium">{order.address.fullName}</p>
                <p className="text-[var(--color-text-secondary)]">{order.address.phone}</p>
                <p className="text-[var(--color-text-secondary)]">
                  {order.address.street}
                </p>
                <p className="text-[var(--color-text-secondary)]">
                  {order.address.district}, {order.address.city}
                  {order.address.zipCode && `, ${order.address.zipCode}`}
                </p>
              </div>
            </div>
          )}

          {/* Status redaktoru */}
          <OrderStatusEditor
            orderId={order.id}
            initialStatus={order.status}
            initialPayment={order.paymentStatus}
            initialNotes={order.notes}
          />
        </aside>
      </div>
    </div>
  )
}
