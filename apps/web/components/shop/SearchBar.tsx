'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'

export function SearchBar() {
  const router = useRouter()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [value, setValue] = useState(params.get('q') ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next = new URLSearchParams(params.toString())
    if (value.trim()) next.set('q', value.trim())
    else next.delete('q')
    next.delete('page')
    startTransition(() => router.push(`/products?${next.toString()}`))
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
      />
      <Input
        type="search"
        placeholder="Məhsul axtar..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-10"
      />
      {pending && (
        <Loader2
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--color-muted)]"
        />
      )}
    </form>
  )
}
