'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface CategoryOption {
  id: string
  name: string
}

export function ProductFilters({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter()
  const params = useSearchParams()
  const [, startTransition] = useTransition()
  const [q, setQ] = useState(params.get('q') ?? '')

  function apply(next: URLSearchParams) {
    next.delete('page')
    startTransition(() => router.push(`/admin/products?${next.toString()}`))
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const next = new URLSearchParams(params.toString())
    if (q.trim()) next.set('q', q.trim())
    else next.delete('q')
    apply(next)
  }

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    apply(next)
  }

  function clearAll() {
    setQ('')
    startTransition(() => router.push('/admin/products'))
  }

  const hasFilters = Array.from(params.keys()).some((k) => k !== 'page')

  return (
    <div className="card p-4 shadow-card">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
        <form onSubmit={handleSearch} className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <Input
            placeholder="Məhsul adı və ya SKU ilə axtar..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </form>

        <Select
          aria-label="Kateqoriya"
          value={params.get('categoryId') ?? ''}
          onChange={(e) => setParam('categoryId', e.target.value)}
        >
          <option value="">Hər kateqoriya</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Status"
          value={params.get('status') ?? ''}
          onChange={(e) => setParam('status', e.target.value)}
        >
          <option value="">Hər status</option>
          <option value="active">Aktiv</option>
          <option value="inactive">Deaktiv</option>
        </Select>

        {hasFilters && (
          <Button variant="ghost" onClick={clearAll}>
            <X size={14} /> Təmizlə
          </Button>
        )}
      </div>
    </div>
  )
}
