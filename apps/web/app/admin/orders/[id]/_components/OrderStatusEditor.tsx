'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { OrderStatus, PaymentStatus } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { FormField } from '@/components/ui/FormField'
import {
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from '@/components/admin/OrderStatusBadge'

interface Props {
  orderId: string
  initialStatus: OrderStatus
  initialPayment: PaymentStatus
  initialNotes: string | null
}

export function OrderStatusEditor({
  orderId,
  initialStatus,
  initialPayment,
  initialNotes,
}: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(initialStatus)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(initialPayment)
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dirty =
    status !== initialStatus ||
    paymentStatus !== initialPayment ||
    (notes ?? '') !== (initialNotes ?? '')

  async function handleSave() {
    setError(null)
    setSuccess(false)
    setSaving(true)
    try {
      // CANCELLED-ə keçəndə xəbərdarlıq
      if (status === 'CANCELLED' && initialStatus !== 'CANCELLED') {
        if (!confirm('Sifariş ləğv edilsin? Stok geri qaytarılacaq.')) {
          setSaving(false)
          return
        }
      }

      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          paymentStatus,
          notes: notes || null,
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setError(data.error ?? 'Saxlanmadı')
        return
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card p-5 shadow-card space-y-4">
      <h3 className="font-display text-base font-semibold text-[var(--color-text)]">
        Statusu yenilə
      </h3>

      <FormField label="Sifariş statusu">
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
        >
          {ORDER_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Ödəniş statusu">
        <Select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
        >
          {PAYMENT_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Daxili qeyd" hint="Yalnız adminlər görür">
        <Textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </FormField>

      {error && (
        <p className="text-sm text-[var(--color-error)]" role="alert">
          {error}
        </p>
      )}

      <Button
        onClick={handleSave}
        disabled={!dirty || saving}
        className="w-full"
      >
        {saving ? 'Saxlanır...' : success ? '✓ Yeniləndi' : 'Saxla'}
      </Button>
    </div>
  )
}
