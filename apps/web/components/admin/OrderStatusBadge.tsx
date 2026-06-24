import type { OrderStatus, PaymentStatus } from '@prisma/client'

const ORDER_STATUS_STYLES: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-[var(--color-warning-light)]', text: 'text-[var(--color-warning)]', label: 'Gözləyir' },
  CONFIRMED: { bg: 'bg-[var(--color-primary-light)]', text: 'text-[var(--color-primary)]', label: 'Təsdiqlənib' },
  PROCESSING: { bg: 'bg-[var(--color-primary-light)]', text: 'text-[var(--color-accent)]', label: 'Hazırlanır' },
  SHIPPED: { bg: 'bg-[var(--color-primary-light)]', text: 'text-[var(--color-accent)]', label: 'Göndərilib' },
  DELIVERED: { bg: 'bg-[var(--color-success-light)]', text: 'text-[var(--color-success)]', label: 'Çatdırılıb' },
  CANCELLED: { bg: 'bg-[var(--color-error-light)]', text: 'text-[var(--color-error)]', label: 'Ləğv edilib' },
  RETURNED: { bg: 'bg-[var(--color-error-light)]', text: 'text-[var(--color-error)]', label: 'Qaytarılıb' },
}

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, { bg: string; text: string; label: string }> = {
  UNPAID: { bg: 'bg-[var(--color-error-light)]', text: 'text-[var(--color-error)]', label: 'Ödənilməyib' },
  PAID: { bg: 'bg-[var(--color-success-light)]', text: 'text-[var(--color-success)]', label: 'Ödənilib' },
  PARTIAL: { bg: 'bg-[var(--color-warning-light)]', text: 'text-[var(--color-warning)]', label: 'Qismən' },
  REFUNDED: { bg: 'bg-[var(--color-surface-2)]', text: 'text-[var(--color-text-secondary)]', label: 'Geri qaytarılıb' },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const s = ORDER_STATUS_STYLES[status]
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  )
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const s = PAYMENT_STATUS_STYLES[status]
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  )
}

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING', label: 'Gözləyir' },
  { value: 'CONFIRMED', label: 'Təsdiqlənib' },
  { value: 'PROCESSING', label: 'Hazırlanır' },
  { value: 'SHIPPED', label: 'Göndərilib' },
  { value: 'DELIVERED', label: 'Çatdırılıb' },
  { value: 'CANCELLED', label: 'Ləğv edilib' },
  { value: 'RETURNED', label: 'Qaytarılıb' },
]

export const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: 'UNPAID', label: 'Ödənilməyib' },
  { value: 'PAID', label: 'Ödənilib' },
  { value: 'PARTIAL', label: 'Qismən' },
  { value: 'REFUNDED', label: 'Geri qaytarılıb' },
]
