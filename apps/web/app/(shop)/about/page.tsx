import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, ShieldCheck, Truck, Headphones, Award } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Haqqımızda',
  description:
    'Nline Global — mebel aksesuarları və furnitura üzrə ixtisaslaşmış mağaza. Qapı qolları, ayaqlar, mexanizmlər və minlərlə detal.',
}

const values = [
  { icon: Award, title: 'Keyfiyyət', desc: 'Yalnız etibarlı brendlərin sertifikatlı məhsulları' },
  { icon: Truck, title: 'Sürətli çatdırılma', desc: 'Bütün Azərbaycan üzrə operativ çatdırılma' },
  { icon: ShieldCheck, title: 'Zəmanət', desc: 'Məhsullara rəsmi zəmanət və dəstək' },
  { icon: Headphones, title: 'Məsləhət', desc: 'Mütəxəssis komandamız layihənizdə kömək edir' },
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
      {/* Hero */}
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-luxe text-[var(--color-primary)]">
            <span className="h-px w-10 bg-[var(--color-primary)]" />
            Haqqımızda
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl text-balance">
            Mebel furniturasında <span className="italic font-light">etibarlı tərəfdaş</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[var(--color-text-secondary)]">
            Nline Global mebel aksesuarları və furnitura üzrə ixtisaslaşmışdır. Qapı
            qolları, mebel ayaqları, çəkmə mexanizmləri, profillər, menteşələr və
            minlərlə xırda detal — hamısı bir yerdə. İstər ev təmiri, istər peşəkar
            istehsal üçün lazım olan hər şeyi təqdim edirik.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-7 py-3.5 text-sm font-medium text-[var(--color-on-primary)] transition-all hover:bg-[var(--color-primary-hover)] hover:gap-3"
            >
              Məhsullara bax <ArrowUpRight size={16} />
            </Link>
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-7 py-3.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface)]"
            >
              Kateqoriyalar
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image
            src="https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=1400&q=85&auto=format&fit=crop"
            alt="Mebel furniturası"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* Statistika */}
      <div className="mt-20 grid grid-cols-2 gap-8 border-y border-[var(--color-border-light)] py-12 md:grid-cols-4">
        {[
          { v: '1400+', k: 'Məhsul çeşidi' },
          { v: '65+', k: 'Kateqoriya' },
          { v: '5K+', k: 'Məmnun müştəri' },
          { v: '7/24', k: 'Dəstək' },
        ].map((s) => (
          <div key={s.k} className="text-center">
            <p className="font-display text-3xl font-bold text-[var(--color-primary)] sm:text-4xl">
              {s.v}
            </p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{s.k}</p>
          </div>
        ))}
      </div>

      {/* Dəyərlər */}
      <div className="mt-20">
        <h2 className="text-center font-display text-3xl font-bold text-[var(--color-text)]">
          Niyə bizi seçirlər
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 shadow-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                <Icon size={22} />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-[var(--color-text)]">
                {title}
              </h3>
              <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
