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

export interface ProductInitial {
  id?: string
  name: string
  slug: string
  sku: string
  description: string | null
  shortDesc: string | null
  categoryId: string
  basePrice: string
  salePrice: string | null
  costPrice: string | null
  weight: number | null
  material: string | null
  metaTitle: string | null
  metaDesc: string | null
  tags: string[]
  isActive: boolean
  isFeatured: boolean
  hasVariants: boolean
  images: UploadedImage[]
}

interface Props {
  mode: 'create' | 'edit'
  initial?: Partial<ProductInitial>
  categories: CategoryOption[]
}

export function ProductForm({ mode, initial, categories }: Props) {
  const router = useRouter()
  const [name, setName] = useState(initial?.name ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [sku, setSku] = useState(initial?.sku ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [shortDesc, setShortDesc] = useState(initial?.shortDesc ?? '')
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? '')
  const [basePrice, setBasePrice] = useState(initial?.basePrice ?? '')
  const [salePrice, setSalePrice] = useState(initial?.salePrice ?? '')
  const [costPrice, setCostPrice] = useState(initial?.costPrice ?? '')
  const [weight, setWeight] = useState<string>(
    initial?.weight !== null && initial?.weight !== undefined ? String(initial.weight) : ''
  )
  const [material, setMaterial] = useState(initial?.material ?? '')
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle ?? '')
  const [metaDesc, setMetaDesc] = useState(initial?.metaDesc ?? '')
  const [tagsInput, setTagsInput] = useState((initial?.tags ?? []).join(', '))
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false)
  const [hasVariants, setHasVariants] = useState(initial?.hasVariants ?? false)
  const [images, setImages] = useState<UploadedImage[]>(initial?.images ?? [])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

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
        sku,
        description: description || null,
        shortDesc: shortDesc || null,
        categoryId,
        basePrice,
        salePrice: salePrice || null,
        costPrice: costPrice || null,
        weight: weight ? Number(weight) : null,
        material: material || null,
        metaTitle: metaTitle || null,
        metaDesc: metaDesc || null,
        tags: tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        isActive,
        isFeatured,
        hasVariants,
        ...(mode === 'create' && {
          images: images.map((img, i) => ({
            url: img.url,
            key: img.key,
            sortOrder: i,
            isPrimary: i === 0,
          })),
        }),
      }

      const url =
        mode === 'create'
          ? '/api/admin/products'
          : `/api/admin/products/${initial?.id}`
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
      const result = (await res.json()) as { data: { id: string } }

      if (mode === 'create') {
        // Yaradıldıqdan sonra edit səhifəsinə keç (variantlar üçün)
        router.push(`/admin/products/${result.data.id}/edit`)
      } else {
        router.push('/admin/products')
      }
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Əsas məlumat */}
      <div className="card p-6 shadow-card space-y-4">
        <h3 className="font-display text-base font-semibold text-[var(--color-text)]">
          Əsas məlumat
        </h3>
        <FormField label="Məhsul adı" required htmlFor="name">
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Slug" required htmlFor="slug">
            <Input
              id="slug"
              required
              pattern="[a-z0-9-]+"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </FormField>
          <FormField label="SKU" required htmlFor="sku">
            <Input
              id="sku"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Qısa təsvir" htmlFor="shortDesc">
          <Input
            id="shortDesc"
            value={shortDesc ?? ''}
            onChange={(e) => setShortDesc(e.target.value)}
          />
        </FormField>

        <FormField label="Tam təsvir" htmlFor="description">
          <Textarea
            id="description"
            rows={5}
            value={description ?? ''}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormField>

        <FormField label="Kateqoriya" required htmlFor="categoryId">
          <Select
            id="categoryId"
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories.length === 0 ? (
              <option value="">Əvvəlcə kateqoriya yarat</option>
            ) : (
              categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))
            )}
          </Select>
        </FormField>
      </div>

      {/* Qiymət */}
      <div className="card p-6 shadow-card space-y-4">
        <h3 className="font-display text-base font-semibold text-[var(--color-text)]">
          Qiymət
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Baza qiymət (AZN)" required htmlFor="basePrice">
            <Input
              id="basePrice"
              type="number"
              step="0.01"
              min={0}
              required
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
            />
          </FormField>
          <FormField label="Endirimli qiymət" htmlFor="salePrice">
            <Input
              id="salePrice"
              type="number"
              step="0.01"
              min={0}
              value={salePrice ?? ''}
              onChange={(e) => setSalePrice(e.target.value)}
            />
          </FormField>
          <FormField label="Maya dəyəri" htmlFor="costPrice">
            <Input
              id="costPrice"
              type="number"
              step="0.01"
              min={0}
              value={costPrice ?? ''}
              onChange={(e) => setCostPrice(e.target.value)}
            />
          </FormField>
        </div>
      </div>

      {/* Şəkillər */}
      <div className="card p-6 shadow-card space-y-4">
        <h3 className="font-display text-base font-semibold text-[var(--color-text)]">
          Şəkillər
        </h3>
        {mode === 'edit' ? (
          <p className="text-sm text-[var(--color-muted)]">
            Şəkilləri redaktə səhifəsində ayrıca idarə et.
          </p>
        ) : (
          <ImageUpload
            value={images}
            onChange={setImages}
            folder="products"
            multiple
            max={10}
          />
        )}
      </div>

      {/* Əlavə məlumatlar */}
      <div className="card p-6 shadow-card space-y-4">
        <h3 className="font-display text-base font-semibold text-[var(--color-text)]">
          Əlavə məlumatlar
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Çəki (kq)" htmlFor="weight">
            <Input
              id="weight"
              type="number"
              step="0.01"
              min={0}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </FormField>
          <FormField label="Material" htmlFor="material">
            <Input
              id="material"
              value={material ?? ''}
              onChange={(e) => setMaterial(e.target.value)}
            />
          </FormField>
        </div>
        <FormField
          label="Etiketlər"
          htmlFor="tags"
          hint="Vergüllə ayrılmış: yumşaq, modern, palıd"
        >
          <Input
            id="tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </FormField>
      </div>

      {/* SEO */}
      <div className="card p-6 shadow-card space-y-4">
        <h3 className="font-display text-base font-semibold text-[var(--color-text)]">
          SEO
        </h3>
        <FormField label="Meta title" htmlFor="metaTitle">
          <Input
            id="metaTitle"
            maxLength={60}
            value={metaTitle ?? ''}
            onChange={(e) => setMetaTitle(e.target.value)}
          />
        </FormField>
        <FormField label="Meta description" htmlFor="metaDesc">
          <Textarea
            id="metaDesc"
            rows={2}
            maxLength={160}
            value={metaDesc ?? ''}
            onChange={(e) => setMetaDesc(e.target.value)}
          />
        </FormField>
      </div>

      {/* Status */}
      <div className="card p-6 shadow-card space-y-3">
        <h3 className="font-display text-base font-semibold text-[var(--color-text)]">
          Status
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Aktiv (mağazada görünür)
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
            Seçilmiş məhsul (ana səhifədə)
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
            <input
              type="checkbox"
              checked={hasVariants}
              onChange={(e) => setHasVariants(e.target.checked)}
            />
            Variantlar var (rəng / ölçü)
          </label>
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
        <Button type="submit" disabled={saving || categories.length === 0}>
          {saving ? 'Saxlanır...' : mode === 'create' ? 'Yarat və davam et' : 'Yenilə'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin/products')}
        >
          Ləğv et
        </Button>
      </div>
    </form>
  )
}
