'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'

export function CustomersFilter() {
  const router = useRouter()
  const params = useSearchParams()
  const [, startTransition] = useTransition()
  const [q, setQ] = useState(params.get('q') ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next = new URLSearchParams(params.toString())
    if (q.trim()) next.set('q', q.trim())
    else next.delete('q')
    next.delete('page')
    startTransition(() => router.push(`/admin/customers?${next.toString()}`))
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 shadow-card">
      <div className="relative max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
        />
        <Input
          placeholder="Ad, email və ya telefon"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>
    </form>
  )
}
