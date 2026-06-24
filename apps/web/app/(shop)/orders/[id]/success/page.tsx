import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

export default async function OrderSuccessPage({ params }: PageProps) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, address: true },
  })

  if (!order) notFound()

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <CheckCircle2 size={64} className="mx-auto text-[var(--color-success)]" />
      <h1 className="mt-6 font-display text-3xl font-bold text-[var(--color-text)]">
        Sifarişiniz qəbul edildi
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">
        Tezliklə sizinlə əlaqə saxlayacağıq.
      </p>

      <div className="card mt-8 p-6 text-left shadow-card">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-[var(--color-muted)]">Sifariş nömrəsi</span>
          <span className="font-mono text-sm font-medium text-[var(--color-text)]">
            #{order.orderNumber.slice(0, 8).toUpperCase()}
          </span>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span className="text-[var(--color-text)]">
                {item.quantity}× {item.name}
              </span>
              <span className="text-[var(--color-text)]">
                {formatPrice(item.total.toString())}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1.5 border-t border-[var(--color-border-light)] pt-3 text-sm">
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
          <div className="flex justify-between border-t border-[var(--color-border-light)] pt-2 mt-2">
            <span className="font-medium text-[var(--color-text)]">Cəm</span>
            <span className="font-display text-lg font-bold text-[var(--color-primary)]">
              {formatPrice(order.total.toString())}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/products">
          <Button variant="primary">Alış-verişə davam et</Button>
        </Link>
      </div>
    </div>
  )
}
