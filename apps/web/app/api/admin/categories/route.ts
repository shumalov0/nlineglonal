// Admin: bütün kateqoriyalar siyahısı + yenisini yarat
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/server-auth'
import { handleApiError } from '@/lib/api-utils'
import { categoryCreateSchema } from '@/lib/validators/category'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { products: true, children: true } },
      },
    })
    return NextResponse.json({ data: categories })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const data = categoryCreateSchema.parse(body)

    // parentId boşdursa null saxla
    const parentId = data.parentId || null

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        imageUrl: data.imageUrl ?? null,
        imageKey: data.imageKey ?? null,
        parentId,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
    })
    return NextResponse.json({ data: category }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
