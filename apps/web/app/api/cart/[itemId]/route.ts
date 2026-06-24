// Public: cart item — yenilə / sil
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/api-utils'
import { findCart, getCartItems } from '@/lib/cart-service'

interface RouteParams {
  params: { itemId: string }
}

const updateSchema = z.object({
  quantity: z.number().int().positive(),
})

async function ensureItemBelongsToCurrentCart(itemId: string) {
  const cart = await findCart()
  if (!cart) return null
  return cart.items.find((i) => i.id === itemId) ?? null
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const body = await req.json()
    const { quantity } = updateSchema.parse(body)

    const item = await ensureItemBelongsToCurrentCart(params.itemId)
    if (!item) {
      return NextResponse.json({ error: 'Item tapılmadı' }, { status: 404 })
    }

    // Stok yoxlaması
    if (item.variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        select: { stock: true },
      })
      if (variant && variant.stock < quantity) {
        return NextResponse.json(
          { error: `Stokda yalnız ${variant.stock} ədəd var` },
          { status: 400 }
        )
      }
    }

    await prisma.cartItem.update({
      where: { id: params.itemId },
      data: { quantity },
    })

    const items = await getCartItems()
    return NextResponse.json({ data: items })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const item = await ensureItemBelongsToCurrentCart(params.itemId)
    if (!item) {
      return NextResponse.json({ error: 'Item tapılmadı' }, { status: 404 })
    }
    await prisma.cartItem.delete({ where: { id: params.itemId } })
    const items = await getCartItems()
    return NextResponse.json({ data: items })
  } catch (error) {
    return handleApiError(error)
  }
}
