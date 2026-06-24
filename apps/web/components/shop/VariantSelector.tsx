'use client'

import { useMemo, useState } from 'react'
import { ShoppingCart, Loader2, Minus, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/stores/cartStore'
import { toast } from '@/stores/toastStore'
import { formatPrice, cn } from '@/lib/utils'
import {
  findVariant,
  getAttributeGroups,
  getAvailableValueIds,
  getEffectiveVariantPrice,
  type VariantWithAttributes,
} from '@/lib/variant-utils'

interface Props {
  productId: string
  basePrice: string
  salePrice: string | null
  hasVariants: boolean
  variants: VariantWithAttributes[]
  // Variantsız məhsul üçün ümumi stok (basit hal — "həmişə var" hal)
  // Yoxsa qısa məlumat üçün ən azı bir variantın stoku
  defaultStock?: number
}

export function VariantSelector({
  productId,
  basePrice,
  salePrice,
  hasVariants,
  variants,
  defaultStock = 99,
}: Props) {
  const addToCart = useCartStore((s) => s.add)
  const [selection, setSelection] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const groups = useMemo(() => getAttributeGroups(variants), [variants])
  const selected = useMemo(
    () => findVariant(variants, selection),
    [variants, selection]
  )
  const available = useMemo(
    () => getAvailableValueIds(variants, selection),
    [variants, selection]
  )

  const allGroupsSelected =
    groups.length > 0 && groups.every((g) => selection[g.id])

  // Effektiv qiymət
  const pricing = getEffectiveVariantPrice(
    { basePrice, salePrice },
    selected
      ? { price: selected.price?.toString() ?? null, salePrice: selected.salePrice?.toString() ?? null }
      : null
  )

  // Stok
  const stock = hasVariants
    ? selected?.stock ?? 0
    : defaultStock

  const canAdd =
    !hasVariants || (selected !== null && selected.stock > 0 && allGroupsSelected)

  function selectAttribute(typeId: string, valueId: string) {
    setSuccess(false)
    setError(null)
    setSelection((prev) => ({
      ...prev,
      [typeId]: prev[typeId] === valueId ? '' : valueId,
    }))
  }

  async function handleAdd() {
    if (hasVariants && !selected) {
      setError('Bütün atributları seçin')
      return
    }
    setError(null)
    setAdding(true)
    try {
      await addToCart(productId, selected?.id ?? null, quantity)
      setSuccess(true)
      toast.success('Səbətə əlavə edildi', `${quantity} ədəd`)
      setTimeout(() => setSuccess(false), 2000)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Əlavə edilə bilmədi'
      setError(msg)
      toast.error('Əlavə edilə bilmədi', msg)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Qiymət */}
      <div className="flex items-baseline gap-3">
        <span className="font-display text-3xl font-bold text-[var(--color-primary)]">
          {formatPrice(pricing.price)}
        </span>
        {pricing.original && pricing.original > pricing.price && (
          <span className="text-lg text-[var(--color-muted)] line-through">
            {formatPrice(pricing.original)}
          </span>
        )}
      </div>

      {/* Atribut qrupları */}
      {groups.map((group) => (
        <div key={group.id} className="space-y-2">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-medium text-[var(--color-text)]">
              {group.name}
            </h3>
            {selection[group.id] && (
              <span className="text-sm text-[var(--color-muted)]">
                {group.options.find((o) => o.id === selection[group.id])?.value}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {group.options.map((option) => {
              const isSelected = selection[group.id] === option.id
              const isAvailable = available.has(option.id)
              const isDisabled = !isAvailable && !isSelected

              if (group.displayType === 'COLOR' && option.colorCode) {
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-label={option.value}
                    title={option.value + (isDisabled ? ' (mövcud deyil)' : '')}
                    onClick={() => selectAttribute(group.id, option.id)}
                    disabled={isDisabled}
                    className={cn(
                      'relative h-10 w-10 rounded-full border-2 transition-all',
                      isSelected
                        ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30'
                        : 'border-[var(--color-border)] hover:border-[var(--color-text-secondary)]',
                      isDisabled && 'opacity-30 cursor-not-allowed'
                    )}
                    style={{ backgroundColor: option.colorCode }}
                  >
                    {isSelected && (
                      <Check
                        size={16}
                        className="absolute inset-0 m-auto text-white drop-shadow"
                      />
                    )}
                  </button>
                )
              }

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => selectAttribute(group.id, option.id)}
                  disabled={isDisabled}
                  className={cn(
                    'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                      : 'border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface)]',
                    isDisabled &&
                      'opacity-40 cursor-not-allowed line-through hover:bg-transparent'
                  )}
                >
                  {option.value}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Stok statusu */}
      {hasVariants && allGroupsSelected && (
        <div className="text-sm">
          {stock > 0 ? (
            <span className="text-[var(--color-success)]">
              ✓ Stokda var ({stock} ədəd)
            </span>
          ) : (
            <span className="text-[var(--color-error)]">
              ✗ Stokda yoxdur
            </span>
          )}
        </div>
      )}

      {/* Miqdar + Səbətə əlavə */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--color-text-secondary)]">Miqdar:</span>
          <div className="flex items-center rounded-lg border border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Azalt"
              className="p-2 text-[var(--color-text)] hover:bg-[var(--color-surface)]"
            >
              <Minus size={14} />
            </button>
            <span className="px-4 py-2 text-sm font-medium text-[var(--color-text)] min-w-[2.5rem] text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() =>
                setQuantity((q) => Math.min(stock || 99, q + 1))
              }
              aria-label="Artır"
              className="p-2 text-[var(--color-text)] hover:bg-[var(--color-surface)]"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <Button
          size="lg"
          onClick={handleAdd}
          disabled={!canAdd || adding || stock === 0}
          className="w-full"
        >
          {adding ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Əlavə edilir...
            </>
          ) : success ? (
            <>
              <Check size={18} /> Səbətə əlavə edildi
            </>
          ) : (
            <>
              <ShoppingCart size={18} /> Səbətə əlavə et
            </>
          )}
        </Button>

        {error && (
          <p className="text-sm text-[var(--color-error)]" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
