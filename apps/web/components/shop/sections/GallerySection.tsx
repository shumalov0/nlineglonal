import Image from 'next/image'

const galleryImages = [
  {
    src: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1400&q=85&auto=format&fit=crop',
    alt: 'Modern qonaq otağı',
    span: 'col-span-2 row-span-2',
  },
  {
    src: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=85&auto=format&fit=crop',
    alt: 'Yataq otağı',
    span: '',
  },
  {
    src: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=900&q=85&auto=format&fit=crop',
    alt: 'Mətbəx',
    span: '',
  },
  {
    src: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=1400&q=85&auto=format&fit=crop',
    alt: 'İnteryer detalı',
    span: 'col-span-2',
  },
  {
    src: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=900&q=85&auto=format&fit=crop',
    alt: 'Dekor',
    span: '',
  },
  {
    src: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=900&q=85&auto=format&fit=crop',
    alt: 'İş otağı',
    span: '',
  },
]

export function GallerySection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
      <div className="text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-medium uppercase tracking-luxe text-[var(--color-primary)]">
          <span className="h-px w-10 bg-[var(--color-primary)]" />
          Galereya
          <span className="h-px w-10 bg-[var(--color-primary)]" />
        </p>
        <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl">
          İlham verən məkanlar
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--color-muted)]">
          Müştərilərimizin evlərində məhsullarımızın yaratdığı atmosfer
        </p>
      </div>

      <div className="mt-14 grid auto-rows-[200px] grid-cols-2 gap-4 sm:grid-cols-4">
        {galleryImages.map((img, i) => (
          <div
            key={i}
            className={`group relative overflow-hidden rounded-2xl bg-[var(--color-surface-2)] ${img.span}`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="img-zoom object-cover"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
          </div>
        ))}
      </div>
    </section>
  )
}
