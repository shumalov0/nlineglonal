'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Select } from '@/components/ui/Select'

const OPTIONS = [
  { value: 'newest', label: 'Ən yenilər' },
  { value: 'price_asc', label: 'Qiymət: ucuzdan bahaya' },
  { value: 'price_desc', label: 'Qiymət: bahadan ucuza' },
  { value: 'popular', label: 'Populyar' },
]

export function SortSelect() {
  const router = useRouter()
  const params = useSearchParams()
  const [, startTransition] = useTransition()

  function handleChange(value: string) {
    const next = new URLSearchParams(params.toString())
    if (value === 'newest') next.delete('sort')
    else next.set('sort', value)
    next.delete('page')
    startTransition(() => router.push(`/products?${next.toString()}`))
  }

  return (
    <Select
      aria-label="Sıralama"
      value={params.get('sort') ?? 'newest'}
      onChange={(e) => handleChange(e.target.value)}
      className="w-auto"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </Select>
  )
}
