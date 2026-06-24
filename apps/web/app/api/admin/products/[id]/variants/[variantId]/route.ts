// Admin: tək variant — yenilə / sil
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/server-auth'
import { handleApiError } from '@/lib/api-utils'
import { variantUpdateSchema } from '@/lib/validators/product'
import { deleteFromR2 } from '@/lib/r2-upload'

interface RouteParams {
  params: { id: string; variantId: string }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const data = variantUpdateSchema.parse(body)

    // Şəkil dəyişdirilirsə köhnəni R2-dən sil
    if (data.imageKey !== undefined) {
      const old = await prisma.productVariant.findUnique({
        where: { id: params.variantId },
        select: { imageKey: true },
      })
      if (old?.imageKey && old.imageKey !== data.imageKey) {
        await deleteFromR2(old.imageKey).catch((e) => console.warn('[r2 delete]:', e))
      }
    }

    const variant = await prisma.productVariant.update({
      where: { id: params.variantId },
      data: {
        ...(data.sku !== undefined && { sku: data.sku }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.salePrice !== undefined && { salePrice: data.salePrice }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.imageKey !== undefined && { imageKey: data.imageKey }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.attributeValueIds && {
          attributes: {
            set: data.attributeValueIds.map((id) => ({ id })),
          },
        }),
      },
      include: { attributes: { include: { attributeType: true } } },
    })

    return NextResponse.json({ data: variant })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    // Sifariş elementi varsa silmə
    const orderItem = await prisma.orderItem.findFirst({
      where: { variantId: params.variantId },
      select: { id: true },
    })
    if (orderItem) {
      return NextResponse.json(
        { error: 'Bu variant artıq sifariş edilmişdir' },
        { status: 409 }
      )
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: params.variantId },
      select: { imageKey: true },
    })

    await prisma.productVariant.delete({ where: { id: params.variantId } })

    if (variant?.imageKey) {
      await deleteFromR2(variant.imageKey).catch((e) => console.warn('[r2 delete]:', e))
    }

    // Heç variant qalmayıbsa hasVariants-i false et
    const remaining = await prisma.productVariant.count({
      where: { productId: params.id },
    })
    if (remaining === 0) {
      await prisma.product.update({
        where: { id: params.id },
        data: { hasVariants: false },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
