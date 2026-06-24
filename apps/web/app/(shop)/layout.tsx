import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/shop/CartDrawer'
import { WhatsAppButton } from '@/components/layout/WhatsAppButton'
import { getCategoryNav } from '@/lib/category-nav'
import { getSiteSettings } from '@/lib/settings'

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [categories, settings] = await Promise.all([
    getCategoryNav(),
    getSiteSettings(),
  ])

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <CartDrawer />
      <WhatsAppButton whatsappNumber={settings.whatsappNumber} />
    </div>
  )
}
