'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  currentPage: number
  totalPages: number
  basePath?: string
}

export function Pagination({ currentPage, totalPages, basePath = '/products' }: Props) {
  const params = useSearchParams()

  if (totalPages <= 1) return null

  function buildHref(page: number): string {
    const next = new URLSearchParams(params.toString())
    if (page === 1) next.delete('page')
    else next.set('page', String(page))
    const qs = next.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  // Səhifə nömrələrini hesabla — ən çoxu 7 düymə
  const pages: (number | 'ellipsis')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('ellipsis')
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('ellipsis')
    pages.push(totalPages)
  }

  const buttonBase =
    'inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border px-3 text-sm transition-colors'

  return (
    <nav aria-label="Səhifələmə" className="flex items-center justify-center gap-2">
      <Link
        href={buildHref(Math.max(1, currentPage - 1))}
        aria-label="Əvvəlki"
        aria-disabled={currentPage === 1}
        className={cn(
          buttonBase,
          'border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface)]',
          currentPage === 1 && 'pointer-events-none opacity-40'
        )}
      >
        <ChevronLeft size={16} />
      </Link>

      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e-${i}`} className="px-2 text-[var(--color-muted)]">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            className={cn(
              buttonBase,
              p === currentPage
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                : 'border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface)]'
            )}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        aria-label="Növbəti"
        aria-disabled={currentPage === totalPages}
        className={cn(
          buttonBase,
          'border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface)]',
          currentPage === totalPages && 'pointer-events-none opacity-40'
        )}
      >
        <ChevronRight size={16} />
      </Link>
    </nav>
  )
}
