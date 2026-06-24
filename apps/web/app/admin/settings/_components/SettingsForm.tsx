'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, MessageCircle, Mail, MapPin, Instagram, Facebook, Youtube } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { toast } from '@/stores/toastStore'

export interface SettingsValues {
  storeName: string
  phoneNumber: string
  whatsappNumber: string
  email: string
  address: string
  instagramUrl: string
  facebookUrl: string
  tiktokUrl: string
  youtubeUrl: string
}

export function SettingsForm({ initial }: { initial: SettingsValues }) {
  const router = useRouter()
  const [form, setForm] = useState<SettingsValues>(initial)
  const [saving, setSaving] = useState(false)

  function set<K extends keyof SettingsValues>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v.trim() || null])
      )
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string }
        toast.error('Saxlanmadı', d.error)
        return
      }
      toast.success('Tənzimləmələr yeniləndi')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="card p-6 shadow-card space-y-4">
        <h3 className="font-display text-base font-semibold text-[var(--color-text)]">
          Əlaqə məlumatları
        </h3>
        <FormField label="Mağaza adı">
          <Input value={form.storeName} onChange={(e) => set('storeName', e.target.value)} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Telefon" hint="Footer-də göstərilir">
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
              <Input className="pl-9" value={form.phoneNumber} onChange={(e) => set('phoneNumber', e.target.value)} placeholder="+994 50 123 45 67" />
            </div>
          </FormField>
          <FormField label="WhatsApp nömrəsi" hint="Yalnız rəqəm: 994501234567">
            <div className="relative">
              <MessageCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
              <Input className="pl-9" value={form.whatsappNumber} onChange={(e) => set('whatsappNumber', e.target.value)} placeholder="994501234567" />
            </div>
          </FormField>
          <FormField label="Email">
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
              <Input className="pl-9" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
          </FormField>
          <FormField label="Ünvan">
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
              <Input className="pl-9" value={form.address} onChange={(e) => set('address', e.target.value)} />
            </div>
          </FormField>
        </div>
      </div>

      <div className="card p-6 shadow-card space-y-4">
        <h3 className="font-display text-base font-semibold text-[var(--color-text)]">
          Sosial media
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Instagram URL">
            <div className="relative">
              <Instagram size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
              <Input className="pl-9" value={form.instagramUrl} onChange={(e) => set('instagramUrl', e.target.value)} placeholder="https://instagram.com/..." />
            </div>
          </FormField>
          <FormField label="Facebook URL">
            <div className="relative">
              <Facebook size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
              <Input className="pl-9" value={form.facebookUrl} onChange={(e) => set('facebookUrl', e.target.value)} placeholder="https://facebook.com/..." />
            </div>
          </FormField>
          <FormField label="TikTok URL">
            <Input value={form.tiktokUrl} onChange={(e) => set('tiktokUrl', e.target.value)} placeholder="https://tiktok.com/@..." />
          </FormField>
          <FormField label="YouTube URL">
            <div className="relative">
              <Youtube size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
              <Input className="pl-9" value={form.youtubeUrl} onChange={(e) => set('youtubeUrl', e.target.value)} placeholder="https://youtube.com/..." />
            </div>
          </FormField>
        </div>
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? 'Saxlanır...' : 'Yadda saxla'}
      </Button>
    </form>
  )
}
