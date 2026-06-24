import Link from 'next/link'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  FolderTree,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Məhsullar', icon: Package },
  { href: '/admin/categories', label: 'Kateqoriyalar', icon: FolderTree },
  { href: '/admin/orders', label: 'Sifarişlər', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Müştərilər', icon: Users },
  { href: '/admin/settings', label: 'Tənzimləmələr', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex">
      {/* Sidebar — hər iki rejimdə tünd qalır */}
      <aside
        className="w-64 shrink-0 hidden lg:flex flex-col border-r print:hidden"
        style={{
          backgroundColor: 'var(--color-admin-sidebar)',
          borderColor: 'var(--color-admin-border)',
        }}
      >
        <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--color-admin-border)' }}>
          <Link href="/admin" className="font-display text-lg font-bold text-white">
            <span className="text-[var(--color-accent)]">Nline</span> Admin
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-4 border-t" style={{ borderColor: 'var(--color-admin-border)' }}>
          <Link href="/" className="text-xs text-slate-400 hover:text-white">
            ← Mağazaya qayıt
          </Link>
        </div>
      </aside>

      {/* İçərik */}
      <div className="flex-1 flex flex-col">
        <header
          className="h-16 px-6 flex items-center justify-between border-b print:hidden"
          style={{
            backgroundColor: 'var(--color-admin-header)',
            borderColor: 'var(--color-border-light)',
          }}
        >
          <h1 className="font-display text-lg font-semibold text-[var(--color-text)]">
            Admin Panel
          </h1>
        </header>
        <main className="flex-1 p-6 print:p-0">{children}</main>
      </div>
    </div>
  )
}
