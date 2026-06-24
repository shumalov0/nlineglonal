// Admin: sayt tənzimləmələrini al / yenilə
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/server-auth'
import { handleApiError } from '@/lib/api-utils'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  try {
    const row = await prisma.siteSetting.findUnique({ where: { id: 'singleton' } })
    return NextResponse.json({ data: row })
  } catch (error) {
    return handleApiError(error)
  }
}

const schema = z.object({
  phoneNumber: z.string().nullable().optional(),
  whatsappNumber: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  instagramUrl: z.string().nullable().optional(),
  facebookUrl: z.string().nullable().optional(),
  tiktokUrl: z.string().nullable().optional(),
  youtubeUrl: z.string().nullable().optional(),
  storeName: z.string().nullable().optional(),
})

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  try {
    const body = await req.json()
    const data = schema.parse(body)
    const row = await prisma.siteSetting.upsert({
      where: { id: 'singleton' },
      update: data,
      create: { id: 'singleton', ...data },
    })
    return NextResponse.json({ data: row })
  } catch (error) {
    return handleApiError(error)
  }
}
