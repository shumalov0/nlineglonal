import Link from 'next/link'
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react'
import { Logo } from './Logo'
import type { SiteSettings } from '@/lib/settings'

const sections = [
  {
    title: 'Mağaza',
    links: [
      { label: 'Bütün məhsullar', href: '/products' },
      { label: 'Kateqoriyalar', href: '/categories' },
      { label: 'Yeni gələnlər', href: '/products?sort=newest' },
    ],
  },
  {
    title: 'Şirkət',
    links: [
      { label: 'Haqqımızda', href: '/about' },
      { label: 'Hesabım', href: '/account' },
      { label: 'Səbət', href: '/cart' },
    ],
  },
]

export function Footer({ settings }: { settings: SiteSettings }) {
  const socials = [
    settings.instagramUrl && { icon: Instagram, label: 'Instagram', href: settings.instagramUrl },
    settings.facebookUrl && { icon: Facebook, label: 'Facebook', href: settings.facebookUrl },
    settings.youtubeUrl && { icon: Youtube, label: 'YouTube', href: settings.youtubeUrl },
  ].filter(Boolean) as { icon: React.ElementType; label: string; href: string }[]

  return (
    <footer className="mt-20 border-t border-[var(--color-border-light)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_2fr]">
          {/* Şirkət info */}
          <div>
            <Logo className="inline-block" />
            <p className="mt-4 max-w-sm text-sm text-[var(--color-text-secondary)]">
              Mebel aksesuarları və furnitura üzrə etibarlı seçim. Qapı qolları,
              ayaqlar, mexanizmlər, profillər və minlərlə detal.
            </p>

            <div className="mt-6 space-y-2 text-sm">
              {settings.phoneNumber && (
                <a href={`tel:${settings.phoneNumber.replace(/\s/g, '')}`} className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]">
                  <Phone size={14} />
                  {settings.phoneNumber}
                </a>
              )}
              {settings.email && (
                <a href={`mailto:${settings.email}`} className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]">
                  <Mail size={14} />
                  {settings.email}
                </a>
              )}
              {settings.address && (
                <p className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  <MapPin size={14} />
                  {settings.address}
                </p>
              )}
            </div>

            {socials.length > 0 && (
              <div className="mt-6 flex gap-2">
                {socials.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-bg)] text-[var(--color-muted)] transition-colors hover:bg-[var(--color-primary)] hover:text-white"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Linklər */}
          <div className="grid gap-8 sm:grid-cols-2">
            {sections.map((s) => (
              <div key={s.title}>
                <h4 className="font-medium text-[var(--color-text)]">{s.title}</h4>
                <ul className="mt-3 space-y-2">
                  {s.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-border-light)] pt-6 sm:flex-row">
          <p className="text-xs text-[var(--color-muted)]">
            © {new Date().getFullYear()} {settings.storeName ?? 'Nline Global'}. Bütün hüquqlar qorunur.
          </p>
          <p className="text-xs text-[var(--color-muted)]">🇦🇿 Azərbaycan</p>
        </div>
      </div>
    </footer>
  )
}
