// Public: sifariş statusunu/detalını al (sahibinə)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/api-utils'
import { getCurrentUser } from '@/lib/server-auth'

interface RouteParams {
  params: { id: string }
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        address: true,
      },
    })
    if (!order) {
      return NextResponse.json({ error: 'Tapılmadı' }, { status: 404 })
    }

    // İcazə yoxlaması: sahibi və ya admin/manager
    const user = await getCurrentUser()
    const isOwner = user && order.userId === user.id
    const isStaff = user && (user.role === 'ADMIN' || user.role === 'MANAGER')
    const isGuest = !order.userId // qonaq sifarişi — id ilə ictimai

    if (!isOwner && !isStaff && !isGuest) {
      return NextResponse.json({ error: 'İcazəniz yoxdur' }, { status: 403 })
    }

    return NextResponse.json({ data: order })
  } catch (error) {
    return handleApiError(error)
  }
}
