'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ImageData {
  url: string
  altText: string | null
}

interface Props {
  images: ImageData[]
  productName: string
}

export function ProductGallery({ images, productName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-xl bg-[var(--color-surface-2)]" />
    )
  }

  const active = images[activeIndex]

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-[var(--color-surface)]">
        <Image
          src={active.url}
          alt={active.altText ?? productName}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Şəkil ${i + 1}`}
              aria-current={i === activeIndex ? 'true' : undefined}
              className={cn(
                'relative aspect-square overflow-hidden rounded-lg border-2 transition-colors',
                i === activeIndex
                  ? 'border-[var(--color-primary)]'
                  : 'border-[var(--color-border-light)] hover:border-[var(--color-border)]'
              )}
            >
              <Image
                src={img.url}
                alt={img.altText ?? `${productName} ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
