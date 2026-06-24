'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'

interface AttributeValue {
  id: string
  value: string
  colorCode: string | null
}

interface AttributeType {
  id: string
  name: string
  slug: string
  displayType: 'TEXT' | 'COLOR' | 'IMAGE' | 'BUTTON'
  values: AttributeValue[]
}

interface Variant {
  id: string
  sku: string
  price: string | null
  salePrice: string | null
  stock: number
  isActive: boolean
  attributes: { id: string; value: string; attributeType: { name: string; slug: string } }[]
}

interface Props {
  productId: string
  productSku: string
  attributeTypes: AttributeType[]
  variants: Variant[]
}

export function VariantManager({
  productId,
  productSku,
  attributeTypes,
  variants,
}: Props) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Yeni variant formu
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('0')
  const [error, setError] = useState<string | null>(null)

  function resetForm() {
    setSelected({})
    setSku('')
    setPrice('')
    setStock('0')
    setError(null)
    setShowForm(false)
  }

  function buildSku(): string {
    const parts = Object.entries(selected)
      .map(([typeId, valueId]) => {
        const type = attributeTypes.find((t) => t.id === typeId)
        const val = type?.values.find((v) => v.id === valueId)
        return val?.value
      })
      .filter(Boolean)
    return `${productSku}-${parts.join('-').toUpperCase().replace(/\s+/g, '')}`
  }

  async function handleCreate() {
    setError(null)
    const ids = Object.values(selected).filter(Boolean)
    if (ids.length === 0) {
      setError('Ən azı bir atribut seçin')
      return
    }

    setCreating(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: sku || buildSku(),
          price: price || null,
          stock: Number(stock),
          attributeValueIds: ids,
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setError(data.error ?? 'Yaradılmadı')
        return
      }
      resetForm()
      router.refresh()
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu variantı silmək istəyirsiniz?')) return
    setDeletingId(id)
    try {
      const res = await fetch(
        `/api/admin/products/${productId}/variants/${id}`,
        { method: 'DELETE' }
      )
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        alert(data.error ?? 'Silinmədi')
        return
      }
      router.refresh()
    } finally {
      setDeletingId(null)
    }
  }

  async function updateStock(id: string, value: string) {
    const stockNum = Number(value)
    if (isNaN(stockNum) || stockNum < 0) return
    await fetch(`/api/admin/products/${productId}/variants/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: stockNum }),
    })
    router.refresh()
  }

  return (
    <div className="card p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-semibold text-[var(--color-text)]">
            Variantlar
          </h3>
          <p className="text-sm text-[var(--color-muted)]">
            Rəng × ölçü kombinasiyaları və hər biri üçün stok
          </p>
        </div>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus size={14} /> Variant əlavə et
          </Button>
        )}
      </div>

      {/* Mövcud variantlar */}
      {variants.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border-light)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-2)] text-left text-xs uppercase tracking-wider text-[var(--color-muted)]">
              <tr>
                <th className="px-3 py-2">Atributlar</th>
                <th className="px-3 py-2">SKU</th>
                <th className="px-3 py-2 text-right">Qiymət</th>
                <th className="px-3 py-2 text-center">Stok</th>
                <th className="px-3 py-2 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-light)]">
              {variants.map((v) => (
                <tr key={v.id} className="hover:bg-[var(--color-surface)]">
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {v.attributes.map((a) => (
                        <span
                          key={a.id}
                          className="inline-flex rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]"
                        >
                          {a.attributeType.name}: {a.value}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-[var(--color-muted)]">
                    {v.sku}
                  </td>
                  <td className="px-3 py-2 text-right text-[var(--color-text)]">
                    {v.price ?? <span className="text-[var(--color-muted)]">baza</span>}
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      min={0}
                      defaultValue={v.stock}
                      onBlur={(e) => {
                        if (Number(e.target.value) !== v.stock) {
                          void updateStock(v.id, e.target.value)
                        }
                      }}
                      className="mx-auto h-8 w-20 text-center"
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(v.id)}
                      disabled={deletingId === v.id}
                      className="text-[var(--color-error)] hover:bg-[var(--color-error-light)]"
                    >
                      {deletingId === v.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Yeni variant formu */}
      {showForm && (
        <div className="rounded-lg border border-[var(--color-border)] p-4 space-y-3">
          <h4 className="font-medium text-[var(--color-text)]">Yeni variant</h4>

          {attributeTypes.length === 0 && (
            <p className="text-sm text-[var(--color-muted)]">
              Atribut tipi yoxdur. Seed data işlədin.
            </p>
          )}

          {attributeTypes.map((type) => (
            <FormField key={type.id} label={type.name}>
              <div className="flex flex-wrap gap-2">
                {type.values.map((val) => {
                  const active = selected[type.id] === val.id
                  return (
                    <button
                      key={val.id}
                      type="button"
                      onClick={() =>
                        setSelected((prev) => ({
                          ...prev,
                          [type.id]: active ? '' : val.id,
                        }))
                      }
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                        active
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                          : 'border-[var(--color-border)] hover:bg-[var(--color-surface)]'
                      }`}
                    >
                      {val.colorCode && (
                        <span
                          className="h-4 w-4 rounded-full border border-[var(--color-border)]"
                          style={{ backgroundColor: val.colorCode }}
                        />
                      )}
                      {val.value}
                    </button>
                  )
                })}
              </div>
            </FormField>
          ))}

          <div className="grid gap-3 sm:grid-cols-3">
            <FormField label="SKU" hint="boş buraxsanız avto-yaradılacaq">
              <Input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder={buildSku()}
              />
            </FormField>
            <FormField label="Qiymət (boş = baza)">
              <Input
                type="number"
                step="0.01"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </FormField>
            <FormField label="Stok">
              <Input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </FormField>
          </div>

          {error && (
            <p className="text-sm text-[var(--color-error)]" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={creating}>
              {creating ? 'Yaradılır...' : 'Variant əlavə et'}
            </Button>
            <Button size="sm" variant="secondary" onClick={resetForm}>
              Ləğv et
            </Button>
          </div>
        </div>
      )}

      {variants.length === 0 && !showForm && (
        <p className="text-center text-sm text-[var(--color-muted)] py-6">
          Hələ variant yoxdur
        </p>
      )}
    </div>
  )
}
