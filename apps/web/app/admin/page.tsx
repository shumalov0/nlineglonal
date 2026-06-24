import Link from 'next/link'
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from '@/components/admin/OrderStatusBadge'
import { RevenueChart } from './_components/RevenueChart'

export const dynamic = 'force-dynamic'

const dateFmt = new Intl.DateTimeFormat('az-AZ', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

const dayLabelFmt = new Intl.DateTimeFormat('az-AZ', {
  day: '2-digit',
  month: 'short',
})

const LOW_STOCK_THRESHOLD = 5
const REVENUE_DAYS = 30

interface DayBucket {
  date: string
  label: string
  revenue: number
  orders: number
}

async function getDashboardData() {
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const revenueStart = new Date(startOfDay)
  revenueStart.setDate(revenueStart.getDate() - (REVENUE_DAYS - 1))

  const [
    productCount,
    orderCount,
    customerCount,
    revenueAggMonth,
    revenueAggDay,
    revenueOrders,
    recentOrders,
    lowStockVariants,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.aggregate({
      where: { paymentStatus: 'PAID', createdAt: { gte: startOfMonth } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { paymentStatus: 'PAID', createdAt: { gte: startOfDay } },
      _sum: { total: true },
    }),
    prisma.order.findMany({
      where: { paymentStatus: 'PAID', createdAt: { gte: revenueStart } },
      select: { total: true, createdAt: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.productVariant.findMany({
      where: { stock: { lte: LOW_STOCK_THRESHOLD }, isActive: true },
      orderBy: { stock: 'asc' },
      take: 5,
      include: {
        product: { select: { id: true, name: true, slug: true } },
        attributes: {
          select: { value: true, attributeType: { select: { name: true } } },
        },
      },
    }),
  ])

  // 30 günlük gəlir buketi
  const buckets: Record<string, DayBucket> = {}
  for (let i = 0; i < REVENUE_DAYS; i++) {
    const d = new Date(revenueStart)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    buckets[key] = {
      date: key,
      label: dayLabelFmt.format(d),
      revenue: 0,
      orders: 0,
    }
  }
  for (const order of revenueOrders) {
    const key = order.createdAt.toISOString().slice(0, 10)
    if (buckets[key]) {
      buckets[key].revenue += Number(order.total)
      buckets[key].orders += 1
    }
  }

  return {
    productCount,
    orderCount,
    customerCount,
    revenueMonth: Number(revenueAggMonth._sum.total ?? 0),
    revenueToday: Number(revenueAggDay._sum.total ?? 0),
    chart: Object.values(buckets),
    recentOrders,
    lowStockVariants,
  }
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData()

  const cards = [
    {
      label: 'Aktiv məhsullar',
      value: data.productCount,
      icon: Package,
      color: 'text-[var(--color-primary)]',
      href: '/admin/products',
    },
    {
      label: 'Bütün sifarişlər',
      value: data.orderCount,
      icon: ShoppingBag,
      color: 'text-[var(--color-accent)]',
      href: '/admin/orders',
    },
    {
      label: 'Müştərilər',
      value: data.customerCount,
      icon: Users,
      color: 'text-[var(--color-success)]',
      href: '/admin/customers',
    },
    {
      label: 'Bu ay gəlir',
      value: formatPrice(data.revenueMonth),
      icon: DollarSign,
      color: 'text-[var(--color-warning)]',
      sub: `Bu gün: ${formatPrice(data.revenueToday)}`,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-[var(--color-text)]">
          Dashboard
        </h2>
        <p className="text-[var(--color-muted)]">
          Mağazanın ümumi vəziyyəti.
        </p>
      </div>

      {/* Stat kartlar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color, sub, href }) => {
          const content = (
            <div className="card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-muted)]">{label}</span>
                <Icon size={20} className={color} />
              </div>
              <div className="mt-2 font-display text-2xl font-bold text-[var(--color-text)]">
                {value}
              </div>
              {sub && (
                <div className="mt-1 text-xs text-[var(--color-muted)]">{sub}</div>
              )}
            </div>
          )
          return href ? (
            <Link key={label} href={href} className="block transition-transform hover:-translate-y-0.5">
              {content}
            </Link>
          ) : (
            <div key={label}>{content}</div>
          )
        })}
      </div>

      {/* Gəlir qrafiki */}
      <div className="card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-[var(--color-text)]">
            Son {REVENUE_DAYS} günün gəliri
          </h3>
        </div>
        <div className="mt-4">
          <RevenueChart data={data.chart} />
        </div>
      </div>

      {/* Son sifarişlər + Az stok */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Son sifarişlər */}
        <div className="card overflow-hidden shadow-card">
          <div className="flex items-center justify-between border-b border-[var(--color-border-light)] px-5 py-3">
            <h3 className="font-medium text-[var(--color-text)]">Son sifarişlər</h3>
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              Hamısı →
            </Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <p className="py-10 text-center text-sm text-[var(--color-muted)]">
              Hələ sifariş yoxdur
            </p>
          ) : (
            <ul className="divide-y divide-[var(--color-border-light)]">
              {data.recentOrders.map((o) => {
                const customer = o.user?.name ?? o.guestName ?? 'Qonaq'
                return (
                  <li key={o.id}>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-[var(--color-surface)]"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-[var(--color-muted)]">
                            #{o.orderNumber.slice(0, 8).toUpperCase()}
                          </span>
                          <OrderStatusBadge status={o.status} />
                          <PaymentStatusBadge status={o.paymentStatus} />
                        </div>
                        <p className="mt-0.5 truncate text-[var(--color-text)]">
                          {customer}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-[var(--color-text)]">
                          {formatPrice(o.total.toString())}
                        </p>
                        <p className="text-xs text-[var(--color-muted)]">
                          {dateFmt.format(o.createdAt)}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-[var(--color-muted)]" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Az stoklu variantlar */}
        <div className="card overflow-hidden shadow-card">
          <div className="flex items-center justify-between border-b border-[var(--color-border-light)] px-5 py-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-[var(--color-warning)]" />
              <h3 className="font-medium text-[var(--color-text)]">
                Az stoklu məhsullar
              </h3>
            </div>
            <span className="text-xs text-[var(--color-muted)]">
              ≤ {LOW_STOCK_THRESHOLD} ədəd
            </span>
          </div>
          {data.lowStockVariants.length === 0 ? (
            <p className="py-10 text-center text-sm text-[var(--color-muted)]">
              Stok normal səviyyədədir 👍
            </p>
          ) : (
            <ul className="divide-y divide-[var(--color-border-light)]">
              {data.lowStockVariants.map((v) => (
                <li key={v.id}>
                  <Link
                    href={`/admin/products/${v.product.id}/edit`}
                    className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-[var(--color-surface)]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-[var(--color-text)]">
                        {v.product.name}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                        {v.attributes.length > 0
                          ? v.attributes
                              .map((a) => `${a.attributeType.name}: ${a.value}`)
                              .join(' • ')
                          : v.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          v.stock === 0
                            ? 'bg-[var(--color-error-light)] text-[var(--color-error)]'
                            : 'bg-[var(--color-warning-light)] text-[var(--color-warning)]'
                        }`}
                      >
                        {v.stock} ədəd
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Sürətli linklər */}
      <div className="card p-5 shadow-card">
        <h3 className="font-display text-base font-semibold text-[var(--color-text)]">
          Sürətli əməliyyatlar
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/admin/products/new">
            <Button size="sm" variant="primary">
              Yeni məhsul
            </Button>
          </Link>
          <Link href="/admin/categories/new">
            <Button size="sm" variant="secondary">
              Yeni kateqoriya
            </Button>
          </Link>
          <Link href="/admin/orders?status=PENDING">
            <Button size="sm" variant="secondary">
              Gözləyən sifarişlər
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
