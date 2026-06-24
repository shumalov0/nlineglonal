'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone: phone || undefined }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Qeydiyyat alınmadı')
        return
      }
      // Qeydiyyatdan sonra avtomatik giriş
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (!result?.error) {
        router.push('/')
        router.refresh()
      } else {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-8 shadow-card">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">
        Qeydiyyat
      </h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Artıq hesabın var?{' '}
        <Link href="/login" className="text-[var(--color-primary)] hover:underline">
          Daxil ol
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
            Ad Soyad
          </label>
          <input
            type="text"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-lg px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-border-focus)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
            Email
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-lg px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-border-focus)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
            Telefon (istəyə görə)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full rounded-lg px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-border-focus)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
            Şifrə
          </label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-lg px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-border-focus)]"
          />
          <p className="mt-1 text-xs text-[var(--color-muted)]">Ən azı 8 simvol</p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg p-3 text-sm bg-[var(--color-error-light)] text-[var(--color-error)]"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg px-4 py-2.5 font-medium bg-[var(--color-primary)] text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Yaradılır...' : 'Hesab yarat'}
        </button>
      </form>
    </div>
  )
}
