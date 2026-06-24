'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import type { NavCategory } from '@/lib/category-nav'

interface Props {
  categories: NavCategory[]
}

// Desktop mega-menu — kateqoriyalar və alt kateqoriyalar
export function CategoryMenu({ categories }: Props) {
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function show() {
    if (timer.current) clearTimeout(timer.current)
    setOpen(true)
  }
  function hide() {
    timer.current = setTimeout(() => setOpen(false), 150)
  }

  if (categories.length === 0) {
    return (
      <Link
        href="/categories"
        className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
      >
        Kateqoriyalar
      </Link>
    )
  }

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <button
        type="button"
        className="flex items-center gap-1 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
        aria-expanded={open}
      >
        Kateqoriyalar
        <ChevronDown size={14} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>

      {open && (
        <div
          className="
            absolute left-0 top-full z-50 mt-2 w-64
            rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg)]
            py-2 shadow-card-lg
          "
        >
          <ul className="max-h-[70vh] overflow-y-auto">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="flex items-center justify-between px-4 py-2.5 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)]"
                >
                  <span>{cat.name}</span>
                  <span className="text-xs text-[var(--color-muted)]">
                    {cat.productCount}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-1 border-t border-[var(--color-border-light)] px-4 pt-2">
            <Link
              href="/categories"
              className="text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              Hamısına bax →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
