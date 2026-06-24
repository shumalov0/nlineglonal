import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, ShoppingBag, MapPin } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/shop/CartDrawer'
import { WhatsAppButton } from '@/components/layout/WhatsAppButton'
import { getCurrentUser } from '@/lib/server-auth'
import { getCategoryNav } from '@/lib/category-nav'
import { getSiteSettings } from '@/lib/settings'

const navItems = [
  { href: '/account', label: 'Profil', icon: User },
  { href: '/account/orders', label: 'Sifarişlərim', icon: ShoppingBag },
  { href: '/account/addresses', label: 'Ünvanlarım', icon: MapPin },
]

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login?callbackUrl=/account')
  }

  const [categories, settings] = await Promise.all([
    getCategoryNav(),
    getSiteSettings(),
  ])

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <Header categories={categories} />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[14rem_1fr]">
            <aside>
              <div className="card p-4 shadow-card">
                <div className="border-b border-[var(--color-border-light)] pb-3">
                  <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                    Hesab
                  </p>
                  <p className="mt-0.5 truncate font-medium text-[var(--color-text)]">
                    {user.name ?? user.email}
                  </p>
                </div>
                <nav className="mt-2 space-y-0.5">
                  {navItems.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                    >
                      <Icon size={16} />
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>
            <div>{children}</div>
          </div>
        </div>
      </main>
      <Footer settings={settings} />
      <CartDrawer />
      <WhatsAppButton whatsappNumber={settings.whatsappNumber} />
    </div>
  )
}
