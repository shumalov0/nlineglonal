'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { FormField } from '@/components/ui/FormField'
import { useCartStore, getCartSummary } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'

const SHIPPING_COST = 10

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const items = useCartStore((s) => s.items)
  const fetchCart = useCartStore((s) => s.fetch)
  const clear = useCartStore((s) => s.clear)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [addressText, setAddressText] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void fetchCart()
  }, [fetchCart])

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name)
  }, [session])

  const summary = getCartSummary(items)
  const total = summary.subtotal + SHIPPING_COST

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          addressText: addressText || null,
          notes: notes || null,
          paymentMethod: 'CASH_ON_DELIVERY',
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setError(data.error ?? 'Sifariş yaradılmadı')
        return
      }
      const result = (await res.json()) as { data: { id: string } }
      clear()
      router.push(`/orders/${result.data.id}/success`)
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={32} className="animate-spin text-[var(--color-muted)]" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-lg text-[var(--color-text)]">Səbətiniz boşdur.</p>
        <Link href="/products">
          <Button className="mt-4">Məhsullara bax</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-[var(--color-text)]">
        Sifarişi tamamla
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">
        Sadəcə adınız və telefon nömrəniz kifayətdir — sizinlə əlaqə saxlayacağıq.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <div className="card p-6 shadow-card space-y-4">
            <h2 className="font-display text-base font-semibold text-[var(--color-text)]">
              Əlaqə məlumatı
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Ad Soyad" required htmlFor="name">
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adınız"
                />
              </FormField>
              <FormField label="Telefon" required htmlFor="phone">
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+994 50 123 45 67"
                />
              </FormField>
            </div>
            <FormField
              label="Çatdırılma ünvanı"
              htmlFor="addressText"
              hint="İstəyə görə — operator zəng edəndə dəqiqləşdirə bilərsiniz"
            >
              <Input
                id="addressText"
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                placeholder="Şəhər, rayon, küçə..."
              />
            </FormField>
            <FormField label="Sifariş qeydi" htmlFor="notes">
              <Textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Əlavə qeyd (istəyə görə)"
              />
            </FormField>
          </div>

          {error && (
            <div role="alert" className="rounded-lg p-3 text-sm bg-[var(--color-error-light)] text-[var(--color-error)]">
              {error}
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5 shadow-card space-y-4">
            <h2 className="font-display text-base font-semibold text-[var(--color-text)]">
              Sifariş xülasəsi
            </h2>
            <ul className="space-y-3 text-sm">
              {items.map((item) => {
                const variantPrice = item.variant?.salePrice ?? item.variant?.price
                const productPrice = item.product.salePrice ?? item.product.basePrice
                const price = parseFloat(variantPrice ?? productPrice)
                return (
                  <li key={item.id} className="flex items-start gap-2">
                    <span className="text-[var(--color-muted)]">{item.quantity}×</span>
                    <span className="flex-1 text-[var(--color-text)] line-clamp-2">
                      {item.product.name}
                    </span>
                    <span className="text-[var(--color-text)]">
                      {formatPrice(price * item.quantity)}
                    </span>
                  </li>
                )
              })}
            </ul>
            <div className="space-y-1.5 border-t border-[var(--color-border-light)] pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">Ara cəm</span>
                <span className="text-[var(--color-text)]">{formatPrice(summary.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">Çatdırılma</span>
                <span className="text-[var(--color-text)]">{formatPrice(SHIPPING_COST)}</span>
              </div>
            </div>
            <div className="flex justify-between border-t border-[var(--color-border-light)] pt-3">
              <span className="font-medium text-[var(--color-text)]">Cəm</span>
              <span className="font-display text-xl font-bold text-[var(--color-primary)]">
                {formatPrice(total)}
              </span>
            </div>
            <p className="text-xs text-[var(--color-muted)]">
              Ödəniş çatdırılma zamanı nağd və ya kartla.
            </p>
            <Button type="submit" size="lg" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Göndərilir...
                </>
              ) : (
                'Sifarişi təsdiqlə'
              )}
            </Button>
          </div>
        </aside>
      </form>
    </div>
  )
}
