// Ümumi köməkçi funksiyalar
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// Azərbaycan dili üçün slug generasiyası
const AZ_MAP: Record<string, string> = {
  ə: 'e',
  ş: 's',
  ğ: 'g',
  ü: 'u',
  ö: 'o',
  ı: 'i',
  ç: 'c',
  Ə: 'E',
  Ş: 'S',
  Ğ: 'G',
  Ü: 'U',
  Ö: 'O',
  I: 'I',
  Ç: 'C',
}

export function slugify(text: string): string {
  return text
    .split('')
    .map((char) => AZ_MAP[char] ?? char)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Qiymət formatlama (AZN)
export function formatPrice(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('az-AZ', {
    style: 'currency',
    currency: 'AZN',
    minimumFractionDigits: 2,
  }).format(num)
}

// Effektiv qiymət hesablama
// CLAUDE.md qaydası: variant.salePrice ?? variant.price ?? product.salePrice ?? product.basePrice
export interface PricingInput {
  basePrice: number | string
  salePrice?: number | string | null
  variantPrice?: number | string | null
  variantSalePrice?: number | string | null
}

export function getEffectivePrice(input: PricingInput): number {
  const toNum = (v: number | string | null | undefined): number | null => {
    if (v === null || v === undefined) return null
    const n = typeof v === 'string' ? parseFloat(v) : v
    return isNaN(n) ? null : n
  }

  return (
    toNum(input.variantSalePrice) ??
    toNum(input.variantPrice) ??
    toNum(input.salePrice) ??
    toNum(input.basePrice) ??
    0
  )
}
