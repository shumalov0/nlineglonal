import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

interface CategoryItem {
  id: string
  name: string
  slug: string
  imageUrl: string | null
}

interface Props {
  categories: CategoryItem[]
}

// Yüksək çözünürlüklü, seçilmiş mebel interyer fotoları
const FALLBACKS: Record<string, string> = {
  'yataq-otagi':
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&q=85&auto=format&fit=crop',
  'qonaq-otagi':
    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200&q=85&auto=format&fit=crop',
  metbex:
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&q=85&auto=format&fit=crop',
  ofis:
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=85&auto=format&fit=crop',
  'xirda-detallar':
    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1200&q=85&auto=format&fit=crop',
}

const DEFAULT_FALLBACK =
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=85&auto=format&fit=crop'

export function CategoryCircles({ categories }: Props) {
  if (categories.length === 0) return null

  // İlk 5 kateqoriya editorial grid üçün
  const items = categories.slice(0, 5)

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-luxe text-[var(--color-primary)]">
            <span className="h-px w-10 bg-[var(--color-primary)]" />
            Kateqoriyalar
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl">
            Hər otaq üçün
          </h2>
        </div>
        <Link
          href="/categories"
          className="group inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
        >
          Bütün kateqoriyalar
          <ArrowUpRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>

      {/* Editorial asimmetrik grid */}
      <div className="mt-12 grid auto-rows-[260px] grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((c, i) => {
          const img = c.imageUrl ?? FALLBACKS[c.slug] ?? DEFAULT_FALLBACK
          // İlk kateqoriya böyük (2x2), qalanları normal
          const featured = i === 0
          return (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className={`group relative overflow-hidden rounded-2xl ${
                featured ? 'col-span-2 row-span-2' : ''
              }`}
            >
              <Image
                src={img}
                alt={c.name}
                fill
                sizes={featured ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 50vw'}
                className="img-zoom object-cover"
              />
              <div className="absolute inset-0 overlay-bottom" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                <div>
                  <h3 className="font-display text-xl font-semibold text-white sm:text-2xl">
                    {c.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-white/70">Kolleksiyaya bax</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all group-hover:bg-white group-hover:text-black">
                  <ArrowUpRight size={18} />
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
