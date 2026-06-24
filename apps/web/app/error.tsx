'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Production-da error tracking servisinə göndər (Sentry və s.)
    console.error('[GlobalError]:', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <AlertCircle
          size={48}
          className="mx-auto text-[var(--color-error)]"
          aria-hidden="true"
        />
        <h1 className="mt-4 font-display text-2xl font-bold text-[var(--color-text)]">
          Nəsə düzgün getmədi
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Texniki problem baş verdi. Səhifəni yeniləməyə cəhd edin.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-[var(--color-muted)]">
            Reference: {error.digest}
          </p>
        )}
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={reset}>Yenidən cəhd et</Button>
          <Button variant="secondary" onClick={() => (window.location.href = '/')}>
            Ana səhifə
          </Button>
        </div>
      </div>
    </div>
  )
}
