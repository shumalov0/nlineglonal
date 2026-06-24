'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import {
  X,
  Home,
  Package,
  FolderTree,
  Info,
  User as UserIcon,
  ShoppingBag,
  MapPin,
  LogOut,
  LogIn,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavCategory } from '@/lib/category-nav'

interface Props {
  open: boolean
  onClose: () => void
  categories?: NavCategory[]
}

const guestLinks = [
  { href: '/', label: 'Ana səhifə', icon: Home },
  { href: '/products', label: 'Məhsullar', icon: Package },
  { href: '/categories', label: 'Kateqoriyalar', icon: FolderTree },
  { href: '/about', label: 'Haqqımızda', icon: Info },
]

const accountLinks = [
  { href: '/account', label: 'Profil', icon: UserIcon },
  { href: '/account/orders', label: 'Sifarişlərim', icon: ShoppingBag },
  { href: '/account/addresses', label: 'Ünvanlarım', icon: MapPin },
]

export function MobileMenu({ open, onClose }: Props) {
  const { data: session } = useSession()

  // Body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Esc ilə bağla
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-50 bg-black/40 transition-opacity md:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      <aside
        role="dialog"
        aria-label="Naviqasiya menyusu"
        aria-modal="true"
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-72 transform shadow-card-lg transition-transform md:hidden',
          'bg-[var(--color-bg)] border-r border-[var(--color-border-light)] flex flex-col',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border-light)] px-5 py-4">
          <Link
            href="/"
            onClick={onClose}
            className="font-display text-lg font-bold"
          >
            <span className="text-[var(--color-primary)]">Nline</span>{' '}
            <span className="text-[var(--color-text)]">Global</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Bağla"
            className="p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {guestLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}

          <div className="my-2 border-t border-[var(--color-border-light)]" />

          {session ? (
            <>
              <p className="px-3 py-1 text-xs uppercase tracking-wide text-[var(--color-muted)]">
                Hesabım
              </p>
              {accountLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  onClose()
                  signOut({ callbackUrl: '/' })
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--color-error)] hover:bg-[var(--color-error-light)]"
              >
                <LogOut size={18} />
                Çıxış
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
              >
                <LogIn size={18} />
                Daxil ol
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
              >
                <UserIcon size={18} />
                Qeydiyyat
              </Link>
            </>
          )}
        </nav>
      </aside>
    </>
  )
}
