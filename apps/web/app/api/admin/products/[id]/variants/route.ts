// Admin: variantları siyahıla / yarat
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/server-auth'
import { handleApiError } from '@/lib/api-utils'
import { variantCreateSchema } from '@/lib/validators/product'

interface RouteParams {
  params: { id: string }
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const variants = await prisma.productVariant.findMany({
      where: { productId: params.id },
      include: {
        attributes: { include: { attributeType: true } },
      },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ data: variants })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const data = variantCreateSchema.parse(body)

    // Eyni atribut kombinasiyası mövcuddurmu?
    const existing = await prisma.productVariant.findMany({
      where: {
        productId: params.id,
        attributes: { every: { id: { in: data.attributeValueIds } } },
      },
      include: { attributes: { select: { id: true } } },
    })
    const duplicate = existing.find(
      (v) =>
        v.attributes.length === data.attributeValueIds.length &&
        v.attributes.every((a) => data.attributeValueIds.includes(a.id))
    )
    if (duplicate) {
      return NextResponse.json(
        { error: 'Eyni atribut kombinasiyası ilə variant artıq mövcuddur' },
        { status: 409 }
      )
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId: params.id,
        sku: data.sku,
        price: data.price ?? null,
        salePrice: data.salePrice ?? null,
        stock: data.stock,
        imageUrl: data.imageUrl ?? null,
        imageKey: data.imageKey ?? null,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        attributes: {
          connect: data.attributeValueIds.map((id) => ({ id })),
        },
      },
      include: { attributes: { include: { attributeType: true } } },
    })

    // hasVariants flag-ini yenilə
    await prisma.product.update({
      where: { id: params.id },
      data: { hasVariants: true },
    })

    return NextResponse.json({ data: variant }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
