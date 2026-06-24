// Public: cart-ı al / item əlavə et
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/api-utils'
import { getCartItems, getOrCreateCart } from '@/lib/cart-service'

export async function GET() {
  try {
    const items = await getCartItems()
    return NextResponse.json({ data: items })
  } catch (error) {
    return handleApiError(error)
  }
}

const addSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().nullable().optional(),
  quantity: z.number().int().positive().default(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = addSchema.parse(body)

    // Məhsul və variantın aktivliyini yoxla
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { id: true, isActive: true, hasVariants: true },
    })
    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Məhsul tapılmadı' }, { status: 404 })
    }

    if (product.hasVariants && !data.variantId) {
      return NextResponse.json(
        { error: 'Variant seçməlisiniz' },
        { status: 400 }
      )
    }

    if (data.variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: data.variantId },
        select: { id: true, productId: true, isActive: true, stock: true },
      })
      if (!variant || !variant.isActive || variant.productId !== data.productId) {
        return NextResponse.json({ error: 'Variant tapılmadı' }, { status: 404 })
      }
      if (variant.stock < data.quantity) {
        return NextResponse.json(
          { error: `Stokda yalnız ${variant.stock} ədəd var` },
          { status: 400 }
        )
      }
    }

    const cart = await getOrCreateCart()

    // Mövcud item-ə əlavə et və ya yenisini yarat
    // Composite unique-də nullable variantId problem yaratdığı üçün manuel pattern
    const existing = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: data.productId,
        variantId: data.variantId ?? null,
      },
    })

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + data.quantity },
      })
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: data.productId,
          variantId: data.variantId ?? null,
          quantity: data.quantity,
        },
      })
    }

    const items = await getCartItems()
    return NextResponse.json({ data: items })
  } catch (error) {
    return handleApiError(error)
  }
}
