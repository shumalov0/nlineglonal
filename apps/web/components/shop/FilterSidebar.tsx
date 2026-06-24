'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'

export interface FilterOption {
  id: string
  label: string
  value: string
  colorCode?: string | null
}

export interface FilterGroup {
  id: string
  label: string
  type: 'category' | 'color' | 'size' | 'attribute'
  options: FilterOption[]
}

interface Props {
  groups: FilterGroup[]
}

export function FilterSidebar({ groups }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  const [minPrice, setMinPrice] = useState(params.get('minPrice') ?? '')
  const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') ?? '')

  function applyFilter(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString())
    if (value && value.length > 0) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    next.delete('page') // filter dəyişəndə səhifəni sıfırla
    startTransition(() => {
      router.push(`/products?${next.toString()}`)
    })
  }

  function toggleArrayParam(key: string, value: string) {
    const current = params.get(key)?.split(',').filter(Boolean) ?? []
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    applyFilter(key, next.length ? next.join(',') : null)
  }

  function isActiveValue(key: string, value: string): boolean {
    const current = params.get(key)?.split(',').filter(Boolean) ?? []
    return current.includes(value)
  }

  function handlePriceSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next = new URLSearchParams(params.toString())
    if (minPrice) next.set('minPrice', minPrice)
    else next.delete('minPrice')
    if (maxPrice) next.set('maxPrice', maxPrice)
    else next.delete('maxPrice')
    next.delete('page')
    startTransition(() => router.push(`/products?${next.toString()}`))
  }

  function clearAll() {
    setMinPrice('')
    setMaxPrice('')
    startTransition(() => router.push('/products'))
  }

  const hasActiveFilters = Array.from(params.keys()).some(
    (k) => k !== 'page' && k !== 'sort' && k !== 'q'
  )

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-[var(--color-text)]">
          Filtrlər
        </h2>
        {hasActiveFilters && (
          <Button size="sm" variant="ghost" onClick={clearAll} disabled={pending}>
            <X size={14} /> Təmizlə
          </Button>
        )}
      </div>

      {/* Qiymət */}
      <form onSubmit={handlePriceSubmit} className="space-y-2">
        <FormField label="Qiymət (AZN)">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <span className="text-[var(--color-muted)]">–</span>
            <Input
              type="number"
              min={0}
              placeholder="Maks"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </FormField>
        <Button size="sm" variant="secondary" type="submit" disabled={pending}>
          Tətbiq et
        </Button>
      </form>

      {/* Stok */}
      <FormField label="Stok">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text)]">
          <input
            type="checkbox"
            checked={params.get('inStock') === 'true'}
            onChange={(e) =>
              applyFilter('inStock', e.target.checked ? 'true' : null)
            }
          />
          Yalnız stokda olanlar
        </label>
      </FormField>

      {/* Dinamik qruplar */}
      {groups.map((group) => (
        <div key={group.id} className="space-y-2">
          <h3 className="text-sm font-medium text-[var(--color-text)]">
            {group.label}
          </h3>
          <ul className="space-y-1.5">
            {group.options.map((option) => {
              const active = isActiveValue(group.id, option.value)
              return (
                <li key={option.id}>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleArrayParam(group.id, option.value)}
                    />
                    {option.colorCode && (
                      <span
                        className="h-4 w-4 shrink-0 rounded-full border border-[var(--color-border)]"
                        style={{ backgroundColor: option.colorCode }}
                      />
                    )}
                    <span>{option.label}</span>
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </aside>
  )
}
