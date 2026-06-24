'use client'

import { useState } from 'react'
import { Mail, ArrowRight } from 'lucide-react'
import { toast } from '@/stores/toastStore'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSubmitting(true)
    // Real backend qoşulduqda /api/newsletter çağrılacaq
    setTimeout(() => {
      toast.success('Təşəkkürlər!', 'Endirim və yeniliklərdən xəbərdar olacaqsınız.')
      setEmail('')
      setSubmitting(false)
    }, 600)
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-[var(--color-surface)] p-8 sm:p-12 lg:p-16 text-center">
        <Mail
          size={36}
          className="mx-auto text-[var(--color-primary)]"
          aria-hidden="true"
        />
        <h2 className="mt-4 font-display text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
          Endirimlər və yeniliklərdən xəbərdar olun
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[var(--color-muted)]">
          Yeni kolleksiya, xüsusi endirim və ekspert məsləhətləri — birbaşa
          email-inizə.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
        >
          <input
            type="email"
            required
            placeholder="email@nümunə.az"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              flex-1 rounded-full px-5 py-3 text-sm
              bg-[var(--color-bg)] border border-[var(--color-border)]
              text-[var(--color-text)] placeholder:text-[var(--color-muted)]
              focus:outline-none focus:border-[var(--color-border-focus)]
            "
          />
          <button
            type="submit"
            disabled={submitting}
            className="
              inline-flex items-center justify-center gap-2 rounded-full px-6 py-3
              bg-[var(--color-primary)] text-[var(--color-on-primary)]
              font-medium shadow-primary transition-all
              hover:bg-[var(--color-primary-hover)] hover:-translate-y-0.5
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {submitting ? 'Göndərilir...' : 'Abunə ol'}
            {!submitting && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="mt-3 text-xs text-[var(--color-muted)]">
          İstədiyiniz vaxt abunəliyi ləğv edə bilərsiniz.
        </p>
      </div>
    </section>
  )
}
