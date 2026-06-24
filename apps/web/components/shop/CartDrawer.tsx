'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { X, ShoppingBag, Minus, Plus, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCartStore, getCartSummary } from '@/stores/cartStore'
import { formatPrice, cn } from '@/lib/utils'

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen)
  const items = useCartStore((s) => s.items)
  const loading = useCartStore((s) => s.loading)
  const close = useCartStore((s) => s.closeDrawer)
  const update = useCartStore((s) => s.update)
  const remove = useCartStore((s) => s.remove)

  const summary = getCartSummary(items)

  // Açıq olduqda body scroll-unu kilidlə
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Esc ilə bağla
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, close])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-50 bg-black/40 transition-opacity',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Səbət"
        aria-modal="true"
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-full max-w-md transform shadow-card-lg transition-transform',
          'bg-[var(--color-bg)] flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Başlıq */}
        <div className="flex items-center justify-between border-b border-[var(--color-border-light)] px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-[var(--color-primary)]" />
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
              Səbət ({summary.itemCount})
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Bağla"
            className="p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]"
          >
            <X size={20} />
          </button>
        </div>

        {/* İçərik */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={24} className="animate-spin text-[var(--color-muted)]" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag size={48} className="text-[var(--color-muted)]" />
              <p className="mt-4 text-[var(--color-text)]">Səbətiniz boşdur</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Məhsullar əlavə etməyə başlayın
              </p>
              <Link href="/products" onClick={close}>
                <Button variant="primary" className="mt-6">
                  Məhsullara bax
                </Button>
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--color-border-light)]">
              {items.map((item) => {
                const variantPrice =
                  item.variant?.salePrice ?? item.variant?.price
                const productPrice =
                  item.product.salePrice ?? item.product.basePrice
                const price = parseFloat(variantPrice ?? productPrice)
                const img =
                  item.variant?.imageUrl ?? item.product.images[0]?.url

                return (
                  <li key={item.id} className="flex gap-3 py-4">
                    <Link
                      href={`/products/${item.product.slug}`}
                      onClick={close}
                      className="block h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--color-surface-2)]"
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
                        onClick={close}
                        className="font-medium text-[var(--color-text)] line-clamp-2 hover:text-[var(--color-primary)]"
                      >
                        {item.product.name}
                      </Link>
                      {item.variant && item.variant.attributes.length > 0 && (
                        <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                          {item.variant.attributes
                            .map((a) => `${a.attributeType.name}: ${a.value}`)
                            .join(' • ')}
                        </p>
                      )}

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-lg border border-[var(--color-border)]">
                          <button
                            type="button"
                            onClick={() => void update(item.id, item.quantity - 1)}
                            aria-label="Azalt"
                            className="p-1.5 text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-2.5 text-sm font-medium text-[var(--color-text)] min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => void update(item.id, item.quantity + 1)}
                            aria-label="Artır"
                            className="p-1.5 text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => void remove(item.id)}
                          aria-label="Sil"
                          className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-light)]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-medium text-[var(--color-text)]">
                        {formatPrice(price * item.quantity)}
                      </p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {formatPrice(price)} / ədəd
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[var(--color-border-light)] p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-muted)]">Cəm</span>
              <span className="font-display text-lg font-bold text-[var(--color-text)]">
                {formatPrice(summary.subtotal)}
              </span>
            </div>
            <p className="text-xs text-[var(--color-muted)]">
              Çatdırılma sifariş zamanı hesablanır.
            </p>
            <Link href="/checkout" onClick={close} className="block">
              <Button size="lg" className="w-full">
                Sifarişi tamamla
              </Button>
            </Link>
            <Link href="/cart" onClick={close} className="block">
              <Button size="md" variant="secondary" className="w-full">
                Səbətə bax
              </Button>
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
