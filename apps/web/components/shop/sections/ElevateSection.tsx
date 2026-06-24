import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

const benefits = [
  {
    n: '01',
    title: 'Əl işi keyfiyyəti',
    desc: 'Hər parça təcrübəli ustalar tərəfindən seçmə materiallardan hazırlanır.',
  },
  {
    n: '02',
    title: 'Davamlı dizayn',
    desc: 'İllər keçsə də aktuallığını qoruyan zamansız estetika.',
  },
  {
    n: '03',
    title: 'Tam zəmanət',
    desc: '12 ay zavod zəmanəti, pulsuz quraşdırma və çatdırılma.',
  },
]

export function ElevateSection() {
  return (
    <section className="bg-[var(--color-surface)]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Sol — böyük tək şəkil + üst-üstə kiçik şəkil */}
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
              <Image
                src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1400&q=88&auto=format&fit=crop"
                alt="Premium mebel detalı"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -right-4 hidden aspect-square w-48 overflow-hidden rounded-2xl ring-8 ring-[var(--color-surface)] sm:block lg:w-56">
              <Image
                src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&q=85&auto=format&fit=crop"
                alt="Material detalı"
                fill
                sizes="224px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Sağ — mətn */}
          <div>
            <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-luxe text-[var(--color-primary)]">
              <span className="h-px w-10 bg-[var(--color-primary)]" />
              Bizim fəlsəfə
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-[var(--color-text)] sm:text-5xl text-balance">
              Detallarda gizlənən
              <br />
              <span className="italic font-light">mükəmməllik</span>
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--color-text-secondary)]">
              Biz sadəcə mebel satmırıq — yaşadığınız məkana xarakter qatırıq.
              Hər məhsul incə zövqün və davamlı keyfiyyətin nəticəsidir.
            </p>

            <div className="mt-10 space-y-6">
              {benefits.map((b) => (
                <div key={b.n} className="flex gap-5">
                  <span className="font-display text-sm font-semibold text-[var(--color-primary)]">
                    {b.n}
                  </span>
                  <div className="border-l border-[var(--color-border)] pl-5">
                    <h3 className="font-display text-lg font-semibold text-[var(--color-text)]">
                      {b.title}
                    </h3>
                    <p className="mt-1 text-[var(--color-text-secondary)]">
                      {b.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/products"
              className="
                group mt-10 inline-flex items-center gap-2 rounded-full
                bg-[var(--color-text)] px-8 py-4 text-sm font-medium text-[var(--color-bg)]
                transition-all hover:gap-3
              "
            >
              Kolleksiyaya bax
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
