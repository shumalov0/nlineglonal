'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2, ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Image {
  id: string
  url: string
  key: string | null
  altText: string | null
  isPrimary: boolean
  sortOrder: number
}

interface Props {
  productId: string
  images: Image[]
}

export function ProductImagesManager({ productId, images }: Props) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'products')
        const uploadRes = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })
        if (!uploadRes.ok) continue
        const uploaded = (await uploadRes.json()) as { url: string; key: string }

        const sortOrder = images.length
        const isPrimary = images.length === 0

        await fetch(`/api/admin/products/${productId}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: uploaded.url,
            key: uploaded.key,
            sortOrder,
            isPrimary,
          }),
        })
      }
      router.refresh()
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(imageId: string) {
    if (!confirm('Şəkili silmək istəyirsiniz?')) return
    setDeletingId(imageId)
    try {
      await fetch(`/api/admin/products/${productId}/images`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId }),
      })
      router.refresh()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="card p-6 shadow-card space-y-4">
      <h3 className="font-display text-base font-semibold text-[var(--color-text)]">
        Şəkillər ({images.length})
      </h3>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="relative aspect-square overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.altText ?? 'Məhsul şəkli'}
              className="h-full w-full object-cover"
            />
            {img.isPrimary && (
              <span className="absolute left-1 top-1 rounded bg-[var(--color-primary)] px-1.5 py-0.5 text-[10px] font-medium text-white">
                ƏSAS
              </span>
            )}
            <button
              type="button"
              onClick={() => handleDelete(img.id)}
              disabled={deletingId === img.id}
              aria-label="Şəkili sil"
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 disabled:opacity-50"
            >
              {deletingId === img.id ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <X size={14} />
              )}
            </button>
          </div>
        ))}

        <label
          className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] ${
            uploading && 'pointer-events-none opacity-60'
          }`}
        >
          {uploading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <>
              <ImagePlus size={24} />
              <span className="text-xs">Şəkil əlavə et</span>
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              void handleUpload(e.target.files)
              e.target.value = ''
            }}
          />
        </label>
      </div>
    </div>
  )
}
