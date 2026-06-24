'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from '@/components/admin/OrderStatusBadge'
import { Search, X } from 'lucide-react'

export function OrderFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const [, startTransition] = useTransition()
  const [q, setQ] = useState(params.get('q') ?? '')

  function applyFilter(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString())
    if (value && value.length > 0) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    next.delete('page')
    startTransition(() => router.push(`/admin/orders?${next.toString()}`))
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    applyFilter('q', q || null)
  }

  function clearAll() {
    setQ('')
    startTransition(() => router.push('/admin/orders'))
  }

  const hasFilters = Array.from(params.keys()).some((k) => k !== 'page')

  return (
    <div className="card p-4 shadow-card">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
          />
          <Input
            placeholder="Sifariş №, müştəri adı və ya email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </form>

        <Select
          aria-label="Sifariş statusu"
          value={params.get('status') ?? ''}
          onChange={(e) => applyFilter('status', e.target.value || null)}
        >
          <option value="">Hər status</option>
          {ORDER_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Ödəniş statusu"
          value={params.get('paymentStatus') ?? ''}
          onChange={(e) => applyFilter('paymentStatus', e.target.value || null)}
        >
          <option value="">Hər ödəniş</option>
          {PAYMENT_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>

        {hasFilters && (
          <Button variant="ghost" onClick={clearAll}>
            <X size={14} /> Təmizlə
          </Button>
        )}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 sm:max-w-md">
        <FormField label="Tarix-dən">
          <Input
            type="date"
            value={params.get('from') ?? ''}
            onChange={(e) => applyFilter('from', e.target.value || null)}
          />
        </FormField>
        <FormField label="Tarix-ə">
          <Input
            type="date"
            value={params.get('to') ?? ''}
            onChange={(e) => applyFilter('to', e.target.value || null)}
          />
        </FormField>
      </div>
    </div>
  )
}
