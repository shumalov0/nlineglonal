'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Trash2, Minus, Plus, ShoppingBag, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCartStore, getCartSummary } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const loading = useCartStore((s) => s.loading)
  const fetchCart = useCartStore((s) => s.fetch)
  const update = useCartStore((s) => s.update)
  const remove = useCartStore((s) => s.remove)

  useEffect(() => {
    void fetchCart()
  }, [fetchCart])

  const summary = getCartSummary(items)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-[var(--color-text)]">
        Səbət
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[var(--color-muted)]" />
        </div>
      ) : items.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center justify-center p-16 text-center">
          <ShoppingBag size={56} className="text-[var(--color-muted)]" />
          <p className="mt-4 text-lg text-[var(--color-text)]">Səbətiniz boşdur</p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Mağazaya qayıdın və məhsullar əlavə edin
          </p>
          <Link href="/products">
            <Button className="mt-6">Məhsullara bax</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem]">
          {/* Item siyahısı */}
          <div className="card divide-y divide-[var(--color-border-light)] shadow-card">
            {items.map((item) => {
              const variantPrice = item.variant?.salePrice ?? item.variant?.price
              const productPrice = item.product.salePrice ?? item.product.basePrice
              const price = parseFloat(variantPrice ?? productPrice)
              const img = item.variant?.imageUrl ?? item.product.images[0]?.url

              return (
                <div key={item.id} className="flex gap-4 p-4 sm:p-5">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="block h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[var(--color-surface-2)]"
                  >
                    {img && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={img}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="font-medium text-[var(--color-text)] hover:text-[var(--color-primary)]"
                    >
                      {item.product.name}
                    </Link>
                    {item.variant && item.variant.attributes.length > 0 && (
                      <p className="mt-1 text-sm text-[var(--color-muted)]">
                        {item.variant.attributes
                          .map((a) => `${a.attributeType.name}: ${a.value}`)
                          .join(' • ')}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="flex items-center rounded-lg border border-[var(--color-border)]">
                        <button
                          type="button"
                          onClick={() => void update(item.id, item.quantity - 1)}
                          aria-label="Azalt"
                          className="p-2 text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-sm font-medium text-[var(--color-text)] min-w-[2.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => void update(item.id, item.quantity + 1)}
                          aria-label="Artır"
                          className="p-2 text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => void remove(item.id)}
                        className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-error)]"
                      >
                        <Trash2 size={14} /> Sil
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-display text-lg font-bold text-[var(--color-text)]">
                      {formatPrice(price * item.quantity)}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {formatPrice(price)} / ədəd
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Yan summary */}
          <aside className="space-y-4">
            <div className="card p-5 shadow-card space-y-3">
              <h2 className="font-display text-base font-semibold text-[var(--color-text)]">
                Sifariş xülasəsi
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Ara cəm</span>
                  <span className="text-[var(--color-text)]">
                    {formatPrice(summary.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Çatdırılma</span>
                  <span className="text-[var(--color-muted)]">
                    Sifariş zamanı hesablanır
                  </span>
                </div>
              </div>
              <div className="border-t border-[var(--color-border-light)] pt-3 flex justify-between">
                <span className="font-medium text-[var(--color-text)]">Cəm</span>
                <span className="font-display text-xl font-bold text-[var(--color-primary)]">
                  {formatPrice(summary.subtotal)}
                </span>
              </div>
              <Link href="/checkout" className="block pt-2">
                <Button size="lg" className="w-full">
                  Sifarişi tamamla
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
