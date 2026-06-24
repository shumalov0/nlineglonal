'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  id: string
  name: string
}

export function DeleteProductButton({ id, name }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (!confirm(`"${name}" məhsulunu silmək istəyirsiniz?`)) return
    setError(null)
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      setError(data.error ?? 'Silinmədi')
      alert(data.error ?? 'Silinmədi')
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleDelete}
      disabled={pending}
      aria-label={`${name} məhsulunu sil`}
      className="text-[var(--color-error)] hover:bg-[var(--color-error-light)]"
    >
      {pending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
      {error && <span className="sr-only">{error}</span>}
    </Button>
  )
}
