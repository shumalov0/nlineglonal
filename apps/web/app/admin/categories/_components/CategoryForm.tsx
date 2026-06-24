'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { FormField } from '@/components/ui/FormField'
import { ImageUpload, type UploadedImage } from '@/components/admin/ImageUpload'
import { slugify } from '@/lib/utils'

interface CategoryOption {
  id: string
  name: string
}

interface Initial {
  id?: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  imageKey: string | null
  parentId: string | null
  sortOrder: number
  isActive: boolean
}

interface Props {
  initial?: Partial<Initial>
  parents: CategoryOption[]
  mode: 'create' | 'edit'
}

export function CategoryForm({ initial, parents, mode }: Props) {
  const router = useRouter()
  const [name, setName] = useState(initial?.name ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [parentId, setParentId] = useState(initial?.parentId ?? '')
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0)
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)
  const [image, setImage] = useState<UploadedImage[]>(
    initial?.imageUrl && initial?.imageKey
      ? [{ url: initial.imageUrl, key: initial.imageKey }]
      : []
  )
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Ad dəyişdikcə slug avtomatik yenilənsin (yeni rejimdə)
  function handleNameChange(value: string) {
    setName(value)
    if (mode === 'create' || !slug) {
      setSlug(slugify(value))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const payload = {
        name,
        slug,
        description: description || null,
        imageUrl: image[0]?.url ?? null,
        imageKey: image[0]?.key ?? null,
        parentId: parentId || null,
        sortOrder: Number(sortOrder),
        isActive,
      }

      const url =
        mode === 'create'
          ? '/api/admin/categories'
          : `/api/admin/categories/${initial?.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setError(data.error ?? 'Saxlanmadı')
        return
      }
      router.push('/admin/categories')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  // Edit zamanı özünü parent kimi göstərmə
  const parentOptions = parents.filter((p) => p.id !== initial?.id)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card p-6 shadow-card space-y-4">
        <FormField label="Ad" required htmlFor="name">
          <Input
            id="name"
            required
            minLength={2}
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </FormField>

        <FormField
          label="Slug"
          required
          htmlFor="slug"
          hint="URL-də göstəriləcək. Yalnız kiçik hərf, rəqəm və '-'."
        >
          <Input
            id="slug"
            required
            pattern="[a-z0-9-]+"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </FormField>

        <FormField label="Təsvir" htmlFor="description">
          <Textarea
            id="description"
            rows={3}
            value={description ?? ''}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormField>

        <FormField label="Şəkil">
          <ImageUpload value={image} onChange={setImage} folder="categories" />
        </FormField>
      </div>

      <div className="card p-6 shadow-card space-y-4">
        <FormField
          label="Parent kateqoriya"
          htmlFor="parentId"
          hint="Boş buraxsanız kök kateqoriya olacaq"
        >
          <Select
            id="parentId"
            value={parentId ?? ''}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">— Yoxdur (kök) —</option>
            {parentOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Sıra" htmlFor="sortOrder">
            <Input
              id="sortOrder"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
          </FormField>

          <FormField label="Status" htmlFor="isActive">
            <Select
              id="isActive"
              value={isActive ? '1' : '0'}
              onChange={(e) => setIsActive(e.target.value === '1')}
            >
              <option value="1">Aktiv</option>
              <option value="0">Deaktiv</option>
            </Select>
          </FormField>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg p-3 text-sm bg-[var(--color-error-light)] text-[var(--color-error)]"
        >
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saxlanır...' : mode === 'create' ? 'Yarat' : 'Yenilə'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin/categories')}
        >
          Ləğv et
        </Button>
      </div>
    </form>
  )
}
