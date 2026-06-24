import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="text-center">
        <p className="font-display text-6xl font-bold text-[var(--color-primary)]">
          404
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold text-[var(--color-text)]">
          Səhifə tapılmadı
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Axtardığın səhifə mövcud deyil və ya yerini dəyişib.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg px-6 py-3 bg-[var(--color-primary)] text-[var(--color-on-primary)] font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          Ana səhifəyə qayıt
        </Link>
      </div>
    </div>
  )
}
