'use client'

import { useCallback, useRef, useState } from 'react'
import { ImagePlus, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface UploadedImage {
  url: string
  key: string
}

interface ImageUploadProps {
  value: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
  folder?: 'products' | 'categories' | 'variants'
  multiple?: boolean
  max?: number
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  folder = 'products',
  multiple = false,
  max = 10,
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return
      setError(null)
      setUploading(true)
      try {
        const limit = multiple ? max - value.length : 1
        const slice = files.slice(0, limit)
        const uploaded: UploadedImage[] = []

        for (const file of slice) {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('folder', folder)
          const res = await fetch('/api/admin/upload', {
            method: 'POST',
            body: formData,
          })
          if (!res.ok) {
            const data = (await res.json().catch(() => ({}))) as { error?: string }
            throw new Error(data.error ?? 'Yükləmə alınmadı')
          }
          const data = (await res.json()) as UploadedImage
          uploaded.push(data)
        }

        onChange(multiple ? [...value, ...uploaded] : uploaded)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Yükləmə alınmadı')
      } finally {
        setUploading(false)
      }
    },
    [folder, max, multiple, onChange, value]
  )

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    void uploadFiles(files)
    // Eyni faylı yenidən seçə bilmək üçün input-u sıfırla
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/')
    )
    void uploadFiles(files)
  }

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const canAdd = multiple ? value.length < max : value.length === 0

  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {value.map((img, i) => (
          <div
            key={img.key}
            className="relative aspect-square overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={`Şəkil ${i + 1}`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label="Şəkili sil"
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            disabled={uploading}
            className={cn(
              'flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors',
              'text-[var(--color-muted)] hover:text-[var(--color-text)]',
              dragOver
                ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                : 'border-[var(--color-border)] hover:bg-[var(--color-surface)]',
              uploading && 'cursor-not-allowed opacity-60'
            )}
          >
            {uploading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                <ImagePlus size={24} />
                <span className="text-xs">
                  {multiple ? 'Şəkil əlavə et' : 'Şəkil seç'}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple={multiple}
        onChange={handleSelect}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-[var(--color-error)]" role="alert">
          {error}
        </p>
      )}
      {multiple && (
        <p className="text-xs text-[var(--color-muted)]">
          {value.length}/{max} şəkil. JPEG, PNG, WebP, GIF — maks. 10MB hər biri.
        </p>
      )}
    </div>
  )
}
