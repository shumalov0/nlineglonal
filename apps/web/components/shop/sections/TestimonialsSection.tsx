import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Aysu Məmmədova',
    role: 'Bakı, dizayner',
    initials: 'AM',
    rating: 5,
    text: 'Aldığım divan həm baxışla, həm də keyfiyyətlə gözləntilərimi üstələdi. Çatdırılma çox sürətli oldu və quraşdırma komandası peşəkardır.',
    color: 'bg-[var(--color-primary)]',
  },
  {
    name: 'Rəşad Tağıyev',
    role: 'Sumqayıt',
    initials: 'RT',
    rating: 5,
    text: 'Yataq otağı dəstini sifariş etdim, hər detal ev şəraitinə mükəmməl uyğunlaşdı. Müştəri xidməti də əla — hər sualıma dərhal cavab verdilər.',
    color: 'bg-[var(--color-warning)]',
  },
  {
    name: 'Nigar Hüseynli',
    role: 'Gəncə',
    initials: 'NH',
    rating: 5,
    text: 'Mətbəx mebellərini yenilədim, illərdir axtardığım stildə tapdım. Qiymət-keyfiyyət baxımından bazarda ən yaxşı seçimdir.',
    color: 'bg-[var(--color-success)]',
  },
]

export function TestimonialsSection() {
  return (
    <section className="bg-[var(--color-surface)] py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">
            — Müştəri rəyləri
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            Müştərilərimiz nə deyir
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[var(--color-muted)]">
            Hər bir məmnun müştəri bizim üçün uğurun ölçüsüdür
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="card relative p-6 shadow-card transition-shadow hover:shadow-card-lg"
            >
              <Quote
                size={32}
                className="absolute right-5 top-5 text-[var(--color-primary-light)]"
                fill="currentColor"
              />

              <div className="flex items-center gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="text-[var(--color-warning)]"
                    fill="currentColor"
                  />
                ))}
              </div>

              <p className="mt-4 text-[var(--color-text-secondary)] leading-relaxed">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="mt-6 flex items-center gap-3 border-t border-[var(--color-border-light)] pt-4">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white ${t.color}`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="font-medium text-[var(--color-text)]">{t.name}</p>
                  <p className="text-xs text-[var(--color-muted)]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
