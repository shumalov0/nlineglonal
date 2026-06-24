// Tək ünvan — yenilə / sil
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/server-auth'
import { handleApiError } from '@/lib/api-utils'
import { addressUpdateSchema } from '@/lib/validators/address'

interface RouteParams {
  params: { id: string }
}

async function ensureOwnership(id: string, userId: string) {
  return prisma.address.findFirst({
    where: { id, userId },
    select: { id: true },
  })
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Daxil olmamısınız' }, { status: 401 })
  }

  try {
    const owned = await ensureOwnership(params.id, user.id)
    if (!owned) {
      return NextResponse.json({ error: 'Tapılmadı' }, { status: 404 })
    }

    const body = await req.json()
    const data = addressUpdateSchema.parse(body)

    const updated = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId: user.id, isDefault: true, NOT: { id: params.id } },
          data: { isDefault: false },
        })
      }
      return tx.address.update({
        where: { id: params.id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.fullName !== undefined && { fullName: data.fullName }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.city !== undefined && { city: data.city }),
          ...(data.district !== undefined && { district: data.district }),
          ...(data.street !== undefined && { street: data.street }),
          ...(data.zipCode !== undefined && { zipCode: data.zipCode }),
          ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
        },
      })
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Daxil olmamısınız' }, { status: 401 })
  }

  try {
    const owned = await ensureOwnership(params.id, user.id)
    if (!owned) {
      return NextResponse.json({ error: 'Tapılmadı' }, { status: 404 })
    }

    // Sifariş ilə bağlıdırsa silmə (snapshot saxlanılır)
    const orderUsing = await prisma.order.findFirst({
      where: { addressId: params.id },
      select: { id: true },
    })
    if (orderUsing) {
      return NextResponse.json(
        { error: 'Bu ünvan sifariş ilə əlaqəlidir, silinə bilməz' },
        { status: 409 }
      )
    }

    await prisma.address.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
