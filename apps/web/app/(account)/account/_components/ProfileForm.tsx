'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { toast } from '@/stores/toastStore'

interface Props {
  initial: { name: string; email: string; phone: string }
}

export function ProfileForm({ initial }: Props) {
  const router = useRouter()
  const [name, setName] = useState(initial.name)
  const [phone, setPhone] = useState(initial.phone)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone: phone || null }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        toast.error('Yenilənmədi', data.error)
        return
      }
      toast.success('Profil yeniləndi')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 shadow-card space-y-4">
      <h2 className="font-display text-base font-semibold text-[var(--color-text)]">
        Şəxsi məlumat
      </h2>

      <FormField label="Email" hint="Email-i dəyişdirmək olmaz">
        <Input value={initial.email} disabled />
      </FormField>

      <FormField label="Ad Soyad" required htmlFor="name">
        <Input
          id="name"
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </FormField>

      <FormField label="Telefon" htmlFor="phone">
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </FormField>

      <Button type="submit" disabled={saving}>
        {saving ? 'Saxlanır...' : 'Yenilə'}
      </Button>
    </form>
  )
}
