'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ShopError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[ShopError]:', error)
  }, [error])

  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <AlertCircle size={48} className="mx-auto text-[var(--color-error)]" />
      <h2 className="mt-4 font-display text-xl font-bold text-[var(--color-text)]">
        Səhifə yüklənmədi
      </h2>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Texniki problem baş verdi. Yenidən cəhd edin.
      </p>
      <Button onClick={reset} className="mt-4">
        Yenidən cəhd et
      </Button>
    </div>
  )
}
