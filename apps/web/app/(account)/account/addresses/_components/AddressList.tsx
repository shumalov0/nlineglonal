'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { toast } from '@/stores/toastStore'

export interface AddressItem {
  id: string
  title: string
  fullName: string
  phone: string
  city: string
  district: string
  street: string
  zipCode: string | null
  isDefault: boolean
}

interface Props {
  initial: AddressItem[]
}

const emptyForm: Omit<AddressItem, 'id'> = {
  title: 'Ev',
  fullName: '',
  phone: '',
  city: '',
  district: '',
  street: '',
  zipCode: '',
  isDefault: false,
}

export function AddressList({ initial }: Props) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [form, setForm] = useState<Omit<AddressItem, 'id'>>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function startCreate() {
    setForm({ ...emptyForm })
    setEditingId('new')
  }

  function startEdit(addr: AddressItem) {
    setForm({
      title: addr.title,
      fullName: addr.fullName,
      phone: addr.phone,
      city: addr.city,
      district: addr.district,
      street: addr.street,
      zipCode: addr.zipCode ?? '',
      isDefault: addr.isDefault,
    })
    setEditingId(addr.id)
  }

  function cancelEdit() {
    setEditingId(null)
    setForm({ ...emptyForm })
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const isNew = editingId === 'new'
      const res = await fetch(
        isNew ? '/api/account/addresses' : `/api/account/addresses/${editingId}`,
        {
          method: isNew ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            zipCode: form.zipCode || null,
          }),
        }
      )
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        toast.error(isNew ? 'Yaradılmadı' : 'Yenilənmədi', data.error)
        return
      }
      toast.success(isNew ? 'Ünvan əlavə edildi' : 'Ünvan yeniləndi')
      cancelEdit()
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu ünvanı silmək istəyirsiniz?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        toast.error('Silinmədi', data.error)
        return
      }
      toast.success('Ünvan silindi')
      router.refresh()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {initial.length === 0 && editingId !== 'new' && (
        <div className="card p-10 text-center shadow-card">
          <MapPin size={40} className="mx-auto text-[var(--color-muted)]" />
          <p className="mt-3 text-[var(--color-text)]">Ünvan yoxdur</p>
          <Button onClick={startCreate} className="mt-4">
            <Plus size={14} /> Ünvan əlavə et
          </Button>
        </div>
      )}

      {initial.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {initial.map((addr) => (
            <div key={addr.id} className="card p-4 shadow-card">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[var(--color-text)]">
                    {addr.title}
                  </span>
                  {addr.isDefault && (
                    <span className="inline-flex rounded-full bg-[var(--color-primary-light)] px-2 py-0.5 text-xs text-[var(--color-primary)]">
                      Standart
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(addr)}
                    aria-label="Redaktə et"
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(addr.id)}
                    disabled={deletingId === addr.id}
                    aria-label="Sil"
                    className="text-[var(--color-error)] hover:bg-[var(--color-error-light)]"
                  >
                    {deletingId === addr.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </Button>
                </div>
              </div>
              <div className="mt-2 space-y-0.5 text-sm">
                <p className="text-[var(--color-text)]">{addr.fullName}</p>
                <p className="text-[var(--color-text-secondary)]">{addr.phone}</p>
                <p className="text-[var(--color-text-secondary)]">{addr.street}</p>
                <p className="text-[var(--color-text-secondary)]">
                  {addr.district}, {addr.city}
                  {addr.zipCode && `, ${addr.zipCode}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {initial.length > 0 && editingId !== 'new' && !editingId && (
        <Button onClick={startCreate} variant="secondary">
          <Plus size={14} /> Yeni ünvan
        </Button>
      )}

      {editingId !== null && (
        <form onSubmit={handleSave} className="card p-5 shadow-card space-y-4">
          <h3 className="font-display text-base font-semibold text-[var(--color-text)]">
            {editingId === 'new' ? 'Yeni ünvan' : 'Ünvanı redaktə et'}
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Başlıq" required>
              <Input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </FormField>
            <FormField label="Tam ad" required>
              <Input
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </FormField>
            <FormField label="Telefon" required>
              <Input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </FormField>
            <FormField label="Şəhər" required>
              <Input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </FormField>
            <FormField label="Rayon" required>
              <Input
                required
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
              />
            </FormField>
            <FormField label="Poçt indeksi">
              <Input
                value={form.zipCode ?? ''}
                onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
              />
            </FormField>
          </div>
          <FormField label="Küçə / ev" required>
            <Input
              required
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
            />
          </FormField>

          <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) =>
                setForm({ ...form, isDefault: e.target.checked })
              }
            />
            Standart ünvan
          </label>

          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saxlanır...' : 'Saxla'}
            </Button>
            <Button type="button" variant="secondary" onClick={cancelEdit}>
              Ləğv et
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
