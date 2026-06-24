'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, User, Search, Menu } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { MobileMenu } from './MobileMenu'
import { Logo } from './Logo'
import { CategoryMenu } from './CategoryMenu'
import { useCartStore, getCartSummary } from '@/stores/cartStore'
import type { NavCategory } from '@/lib/category-nav'

interface Props {
  categories: NavCategory[]
}

export function Header({ categories }: Props) {
  const items = useCartStore((s) => s.items)
  const fetchCart = useCartStore((s) => s.fetch)
  const openDrawer = useCartStore((s) => s.openDrawer)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    void fetchCart()
  }, [fetchCart])

  const { itemCount } = getCartSummary(items)

  return (
    <>
      <header
        className="
          sticky top-0 z-40 w-full border-b
          bg-[var(--color-bg)] border-[var(--color-border-light)]
        "
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          {/* Mobile menu */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Menyunu aç"
            className="-ml-2 p-2 rounded-lg text-[var(--color-text)] hover:bg-[var(--color-surface)] md:hidden"
          >
            <Menu size={20} />
          </button>

          {/* Logo — solda */}
          <Logo className="shrink-0" />

          {/* Desktop nav */}
          <nav className="hidden flex-1 items-center gap-7 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
            >
              Ana səhifə
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
            >
              Məhsullar
            </Link>
            <CategoryMenu categories={categories} />
            <Link
              href="/about"
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
            >
              Haqqımızda
            </Link>
          </nav>

          {/* Sağ actions */}
          <div className="flex items-center gap-1 md:ml-auto">
            <Link
              href="/products"
              aria-label="Axtar"
              className="hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] sm:inline-flex"
            >
              <Search size={19} />
            </Link>
            <ThemeToggle />
            <Link
              href="/account"
              aria-label="Hesab"
              className="hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] sm:inline-flex"
            >
              <User size={19} />
            </Link>
            <button
              type="button"
              onClick={openDrawer}
              aria-label={`Səbət ${itemCount > 0 ? `(${itemCount})` : ''}`}
              className="relative p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
            >
              <ShoppingBag size={19} />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold text-[var(--color-on-primary)]">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} categories={categories} />
    </>
  )
}
