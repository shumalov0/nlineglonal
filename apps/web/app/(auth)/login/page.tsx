'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const callbackUrl = params.get('callbackUrl') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (result?.error) {
        setError('Email və ya şifrə yalnışdır')
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-8 shadow-card">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">
        Hesaba giriş
      </h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Hesabın yoxdur?{' '}
        <Link href="/register" className="text-[var(--color-primary)] hover:underline">
          Qeydiyyatdan keç
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            className="
              mt-1 block w-full rounded-lg px-3 py-2
              bg-[var(--color-bg)] border border-[var(--color-border)]
              text-[var(--color-text)]
              focus:outline-none focus:border-[var(--color-border-focus)]
            "
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
            Şifrə
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
              mt-1 block w-full rounded-lg px-3 py-2
              bg-[var(--color-bg)] border border-[var(--color-border)]
              text-[var(--color-text)]
              focus:outline-none focus:border-[var(--color-border-focus)]
            "
          />
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
          className="
            w-full rounded-lg px-4 py-2.5 font-medium
            bg-[var(--color-primary)] text-[var(--color-on-primary)]
            transition-colors hover:bg-[var(--color-primary-hover)]
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          {loading ? 'Yoxlanılır...' : 'Daxil ol'}
        </button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="card p-8 shadow-card animate-pulse h-96" />}>
      <LoginForm />
    </Suspense>
  )
}
