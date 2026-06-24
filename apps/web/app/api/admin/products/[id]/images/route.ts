// Admin: məhsul şəkillərini idarə et
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/server-auth'
import { handleApiError } from '@/lib/api-utils'
import { deleteFromR2 } from '@/lib/r2-upload'

interface RouteParams {
  params: { id: string }
}

const addImageSchema = z.object({
  url: z.string().url(),
  key: z.string().optional().nullable(),
  altText: z.string().optional().nullable(),
  sortOrder: z.number().int().nonnegative().default(0),
  isPrimary: z.boolean().default(false),
})

export async function POST(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const data = addImageSchema.parse(body)

    // Yeni primary olarsa digərlərini sıfırla
    if (data.isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId: params.id },
        data: { isPrimary: false },
      })
    }

    const image = await prisma.productImage.create({
      data: {
        productId: params.id,
        url: data.url,
        key: data.key ?? null,
        altText: data.altText ?? null,
        sortOrder: data.sortOrder,
        isPrimary: data.isPrimary,
      },
    })
    return NextResponse.json({ data: image }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

const deleteSchema = z.object({ imageId: z.string() })

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const { imageId } = deleteSchema.parse(body)

    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId: params.id },
    })
    if (!image) {
      return NextResponse.json({ error: 'Şəkil tapılmadı' }, { status: 404 })
    }

    await prisma.productImage.delete({ where: { id: imageId } })
    if (image.key) {
      await deleteFromR2(image.key).catch((e) => console.warn('[r2 delete]:', e))
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
