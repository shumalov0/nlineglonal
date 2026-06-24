import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export function PromoBanner() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl">
        {/* Fon şəkli */}
        <div className="relative min-h-[480px] w-full">
          <Image
            src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=2000&q=88&auto=format&fit=crop"
            alt="Yay kolleksiyası"
            fill
            sizes="(min-width: 1024px) 1280px, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
        </div>

        {/* Məzmun */}
        <div className="absolute inset-0 flex items-center">
          <div className="px-8 sm:px-12 lg:px-16">
            <p className="text-xs font-medium uppercase tracking-luxe text-white/70">
              Məhdud müddət
            </p>
            <h2 className="mt-4 max-w-lg font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl text-balance">
              Yeni kolleksiyada
              <br />
              <span className="italic font-light">30%-ə qədər endirim</span>
            </h2>
            <p className="mt-5 max-w-md text-lg text-white/80">
              Seçilmiş yataq otağı, qonaq otağı və ofis məhsullarında xüsusi
              təkliflər. Evinizi yenidən kəşf edin.
            </p>
            <Link
              href="/products"
              className="
                group mt-8 inline-flex items-center gap-2 rounded-full
                bg-white px-8 py-4 text-sm font-medium text-black
                transition-all hover:gap-3
              "
            >
              Endirimli məhsullar
              <ArrowUpRight
                size={18}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
