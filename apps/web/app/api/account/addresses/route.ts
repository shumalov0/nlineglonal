// İstifadəçinin ünvanları — siyahı + yeni
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/server-auth'
import { handleApiError } from '@/lib/api-utils'
import { addressCreateSchema } from '@/lib/validators/address'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Daxil olmamısınız' }, { status: 401 })
  }

  try {
    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { id: 'desc' }],
    })
    return NextResponse.json({ data: addresses })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Daxil olmamısınız' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = addressCreateSchema.parse(body)

    const address = await prisma.$transaction(async (tx) => {
      // Default seçilibsə digərlərini sıfırla
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId: user.id, isDefault: true },
          data: { isDefault: false },
        })
      }
      return tx.address.create({
        data: {
          userId: user.id,
          title: data.title,
          fullName: data.fullName,
          phone: data.phone,
          city: data.city,
          district: data.district,
          street: data.street,
          zipCode: data.zipCode ?? null,
          isDefault: data.isDefault,
        },
      })
    })

    return NextResponse.json({ data: address }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
