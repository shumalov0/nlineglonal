import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative">
      {/* Full-bleed editorial hero */}
      <div className="relative min-h-[88vh] w-full overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=2000&q=90&auto=format&fit=crop"
          alt="Mebel furniturası və aksesuarları"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Dərin gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Məzmun */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl animate-fade-up">
              <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-luxe text-white/70">
                <span className="h-px w-10 bg-white/50" />
                Nline Global · 2026
              </p>

              <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl text-balance">
                Mebel furniturası
                <br />
                <span className="italic font-light">bir ünvanda</span>
              </h1>

              <p className="mt-7 max-w-lg text-lg leading-relaxed text-white/80">
                Qapı qolları, mebel ayaqları, çəkmə mexanizmləri, menteşələr,
                profillər və minlərlə aksesuar. Ev təmiri və peşəkar istehsal
                üçün hər şey — keyfiyyətli və sərfəli.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/products"
                  className="
                    group inline-flex items-center gap-2 rounded-full
                    bg-white px-8 py-4 text-sm font-medium text-black
                    transition-all hover:bg-white/90 hover:gap-3
                  "
                >
                  Kolleksiyanı kəşf et
                  <ArrowUpRight
                    size={18}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
                <Link
                  href="/categories"
                  className="
                    inline-flex items-center gap-2 rounded-full
                    border border-white/30 px-8 py-4 text-sm font-medium text-white
                    backdrop-blur-sm transition-colors hover:bg-white/10
                  "
                >
                  Kateqoriyalar
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Alt sətir — mini info bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/15 bg-black/20 backdrop-blur-md">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 px-6 sm:grid-cols-4 lg:px-8">
            {[
              { k: 'Pulsuz çatdırılma', v: '100 AZN+' },
              { k: 'Zəmanət', v: '12 ay tam' },
              { k: 'Qaytarma', v: '30 gün' },
              { k: 'Reytinq', v: '4.9 / 5.0' },
            ].map((item) => (
              <div key={item.k} className="px-4 py-5 sm:px-6">
                <p className="font-display text-lg font-semibold text-white">
                  {item.v}
                </p>
                <p className="text-xs text-white/60">{item.k}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
