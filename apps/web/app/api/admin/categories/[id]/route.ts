// Admin: tək kateqoriya — al / yenilə / sil
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/server-auth'
import { handleApiError } from '@/lib/api-utils'
import { categoryUpdateSchema } from '@/lib/validators/category'
import { deleteFromR2 } from '@/lib/r2-upload'

interface RouteParams {
  params: { id: string }
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: { parent: true, children: true },
    })
    if (!category) {
      return NextResponse.json({ error: 'Tapılmadı' }, { status: 404 })
    }
    return NextResponse.json({ data: category })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const data = categoryUpdateSchema.parse(body)

    // Özünü parent etməsin
    if (data.parentId === params.id) {
      return NextResponse.json(
        { error: 'Kateqoriya öz parent-i ola bilməz' },
        { status: 400 }
      )
    }

    // Şəkil dəyişdirilirsə köhnəni R2-dən sil
    if (data.imageKey !== undefined) {
      const old = await prisma.category.findUnique({
        where: { id: params.id },
        select: { imageKey: true },
      })
      if (old?.imageKey && old.imageKey !== data.imageKey) {
        await deleteFromR2(old.imageKey).catch((e) => {
          console.warn('[r2 delete]:', e)
        })
      }
    }

    const updated = await prisma.category.update({
      where: { id: params.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.imageKey !== undefined && { imageKey: data.imageKey }),
        ...(data.parentId !== undefined && { parentId: data.parentId || null }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
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
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      select: {
        imageKey: true,
        _count: { select: { products: true, children: true } },
      },
    })

    if (!category) {
      return NextResponse.json({ error: 'Tapılmadı' }, { status: 404 })
    }

    if (category._count.products > 0 || category._count.children > 0) {
      return NextResponse.json(
        {
          error: 'Bu kateqoriyada məhsul və ya alt kateqoriya var. Əvvəlcə onları silin.',
        },
        { status: 409 }
      )
    }

    await prisma.category.delete({ where: { id: params.id } })

    if (category.imageKey) {
      await deleteFromR2(category.imageKey).catch((e) => console.warn('[r2 delete]:', e))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
