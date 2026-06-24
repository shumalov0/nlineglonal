// Admin: məhsul siyahısı + yeni məhsul yarat
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/server-auth'
import { handleApiError } from '@/lib/api-utils'
import { productCreateSchema } from '@/lib/validators/product'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, Number(searchParams.get('page') ?? 1))
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 20)))
    const search = searchParams.get('q')?.trim()
    const categoryId = searchParams.get('categoryId') ?? undefined
    const isActive = searchParams.get('isActive')

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { sku: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(isActive !== null && isActive !== undefined && { isActive: isActive === 'true' }),
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true } },
          images: { where: { isPrimary: true }, take: 1 },
          _count: { select: { variants: true } },
        },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      data: items,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const data = productCreateSchema.parse(body)

    // Şəkillərdən birini primary olduğunu təmin et
    const images = data.images.length
      ? data.images.map((img, i) => ({
          ...img,
          isPrimary: data.images.some((x) => x.isPrimary)
            ? img.isPrimary
            : i === 0,
        }))
      : []

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        shortDesc: data.shortDesc ?? null,
        sku: data.sku,
        categoryId: data.categoryId,
        basePrice: data.basePrice,
        salePrice: data.salePrice ?? null,
        costPrice: data.costPrice ?? null,
        weight: data.weight ?? null,
        dimensions: data.dimensions ?? undefined,
        material: data.material ?? null,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        hasVariants: data.hasVariants,
        metaTitle: data.metaTitle ?? null,
        metaDesc: data.metaDesc ?? null,
        tags: data.tags,
        images: {
          create: images.map((img) => ({
            url: img.url,
            key: img.key ?? null,
            altText: img.altText ?? null,
            sortOrder: img.sortOrder,
            isPrimary: img.isPrimary,
          })),
        },
      },
      include: { images: true, category: true },
    })

    return NextResponse.json({ data: product }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
