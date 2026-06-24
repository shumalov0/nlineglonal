// İstifadəçinin öz profilini yenilə
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/server-auth'
import { handleApiError } from '@/lib/api-utils'

const profileUpdateSchema = z.object({
  name: z.string().min(2),
  phone: z.string().nullable().optional(),
})

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Daxil olmamısınız' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = profileUpdateSchema.parse(body)

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name,
        phone: data.phone ?? null,
      },
      select: { id: true, name: true, email: true, phone: true },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    return handleApiError(error)
  }
}
