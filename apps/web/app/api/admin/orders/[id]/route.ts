// Admin: tək sifariş — al / yenilə (status, qeyd və s.)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/server-auth'
import { handleApiError } from '@/lib/api-utils'
import { orderStatusUpdateSchema } from '@/lib/validators/order-admin'

interface RouteParams {
  params: { id: string }
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        address: true,
        items: true,
      },
    })
    if (!order) {
      return NextResponse.json({ error: 'Tapılmadı' }, { status: 404 })
    }
    return NextResponse.json({ data: order })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const data = orderStatusUpdateSchema.parse(body)

    const current = await prisma.order.findUnique({
      where: { id: params.id },
      select: { status: true },
    })
    if (!current) {
      return NextResponse.json({ error: 'Tapılmadı' }, { status: 404 })
    }

    // CANCELLED-ə keçəndə stoku geri qaytar
    if (data.status === 'CANCELLED' && current.status !== 'CANCELLED') {
      await prisma.$transaction(async (tx) => {
        const items = await tx.orderItem.findMany({
          where: { orderId: params.id, variantId: { not: null } },
          select: { variantId: true, quantity: true },
        })
        for (const item of items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            })
          }
        }
      })
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.paymentStatus && { paymentStatus: data.paymentStatus }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    return handleApiError(error)
  }
}
