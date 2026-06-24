// Sayt tənzimləmələri — əlaqə nömrələri və sosial media
import { prisma } from './db'

export interface SiteSettings {
  phoneNumber: string | null
  whatsappNumber: string | null
  email: string | null
  address: string | null
  instagramUrl: string | null
  facebookUrl: string | null
  tiktokUrl: string | null
  youtubeUrl: string | null
  storeName: string | null
}

const DEFAULTS: SiteSettings = {
  phoneNumber: '+994 50 123 45 67',
  whatsappNumber: '994501234567',
  email: 'info@nlineglobal.az',
  address: 'Bakı, Azərbaycan',
  instagramUrl: null,
  facebookUrl: null,
  tiktokUrl: null,
  youtubeUrl: null,
  storeName: 'Nline Global',
}

// Settings-i al (yoxdursa default qaytarır)
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { id: 'singleton' } })
    if (!row) return DEFAULTS
    return {
      phoneNumber: row.phoneNumber ?? DEFAULTS.phoneNumber,
      whatsappNumber: row.whatsappNumber ?? DEFAULTS.whatsappNumber,
      email: row.email ?? DEFAULTS.email,
      address: row.address ?? DEFAULTS.address,
      instagramUrl: row.instagramUrl,
      facebookUrl: row.facebookUrl,
      tiktokUrl: row.tiktokUrl,
      youtubeUrl: row.youtubeUrl,
      storeName: row.storeName ?? DEFAULTS.storeName,
    }
  } catch {
    return DEFAULTS
  }
}

// WhatsApp linkini formatla (rəqəmlərdən link yarat)
export function buildWhatsappLink(number: string | null, message?: string): string | null {
  if (!number) return null
  const digits = number.replace(/\D/g, '')
  if (!digits) return null
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${digits}${text}`
}
