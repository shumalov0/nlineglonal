// Admin: tək məhsul — al / yenilə / sil
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/server-auth'
import { handleApiError } from '@/lib/api-utils'
import { productUpdateSchema } from '@/lib/validators/product'
import { deleteFromR2 } from '@/lib/r2-upload'

interface RouteParams {
  params: { id: string }
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: {
          include: {
            attributes: { include: { attributeType: true } },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })
    if (!product) {
      return NextResponse.json({ error: 'Tapılmadı' }, { status: 404 })
    }
    return NextResponse.json({ data: product })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const data = productUpdateSchema.parse(body)

    // Şəkillər ayrıca idarə olunur — burada əsas sahələri yenilə
    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.shortDesc !== undefined && { shortDesc: data.shortDesc }),
        ...(data.sku !== undefined && { sku: data.sku }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.basePrice !== undefined && { basePrice: data.basePrice }),
        ...(data.salePrice !== undefined && { salePrice: data.salePrice }),
        ...(data.costPrice !== undefined && { costPrice: data.costPrice }),
        ...(data.weight !== undefined && { weight: data.weight }),
        ...(data.dimensions !== undefined && { dimensions: data.dimensions ?? undefined }),
        ...(data.material !== undefined && { material: data.material }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.hasVariants !== undefined && { hasVariants: data.hasVariants }),
        ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
        ...(data.metaDesc !== undefined && { metaDesc: data.metaDesc }),
        ...(data.tags !== undefined && { tags: data.tags }),
      },
    })
    return NextResponse.json({ data: updated })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    // Bağlı sifariş varsa silmə (snapshot saxlanılır)
    const orderItem = await prisma.orderItem.findFirst({
      where: { productId: params.id },
      select: { id: true },
    })
    if (orderItem) {
      return NextResponse.json(
        {
          error:
            'Bu məhsul artıq sifariş edilmişdir. Silmək yerinə deaktiv etmək tövsiyə olunur.',
        },
        { status: 409 }
      )
    }

    // R2 şəkilləri toplu sil
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        images: { select: { key: true } },
        variants: { select: { imageKey: true } },
      },
    })
    if (!product) {
      return NextResponse.json({ error: 'Tapılmadı' }, { status: 404 })
    }

    await prisma.product.delete({ where: { id: params.id } })

    const keys = [
      ...product.images.map((i) => i.key).filter(Boolean),
      ...product.variants.map((v) => v.imageKey).filter(Boolean),
    ] as string[]
    await Promise.all(
      keys.map((k) => deleteFromR2(k).catch((e) => console.warn('[r2 delete]:', e)))
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
