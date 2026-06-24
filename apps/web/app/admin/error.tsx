'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AdminError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[AdminError]:', error)
  }, [error])

  return (
    <div className="card p-8 text-center shadow-card">
      <AlertCircle size={40} className="mx-auto text-[var(--color-error)]" />
      <h2 className="mt-3 font-display text-lg font-bold text-[var(--color-text)]">
        Admin paneldə xəta
      </h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        {error.message || 'Naməlum xəta'}
      </p>
      <Button onClick={reset} className="mt-4">
        Yenidən cəhd et
      </Button>
    </div>
  )
}
