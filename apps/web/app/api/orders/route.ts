// Public: sifariş yarat (auth və ya guest)
import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/api-utils'
import { findCart } from '@/lib/cart-service'
import { getCurrentUser } from '@/lib/server-auth'
import { orderCreateSchema } from '@/lib/validators/order'
import { applyRateLimit } from '@/lib/rate-limit'

const SHIPPING_COST = 10 // AZN — sadə düz nisbət

export async function POST(req: NextRequest) {
  // Rate limit: IP başına 10 sifariş cəhdi / 10 dəq (bot-larla mübarizə)
  const rl = applyRateLimit(req, {
    limit: 10,
    windowMs: 10 * 60 * 1000,
    key: 'order-create',
  })
  if (rl) return rl

  try {
    const body = await req.json()
    const data = orderCreateSchema.parse(body)

    const user = await getCurrentUser()

    const cart = await findCart()
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Səbət boşdur' }, { status: 400 })
    }

    // Transaction: stok yoxla, azalt, sifariş yarat, səbəti təmizlə
    const order = await prisma.$transaction(
      async (tx) => {
        // Hər item üçün məhsul və variantı təkrar oxu (snapshot məqsədilə)
        let subtotal = 0
        const orderItemsData: Prisma.OrderItemCreateManyOrderInput[] = []

        for (const item of cart.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: {
              id: true,
              name: true,
              sku: true,
              isActive: true,
              basePrice: true,
              salePrice: true,
              hasVariants: true,
              images: {
                where: { isPrimary: true },
                take: 1,
                select: { url: true },
              },
            },
          })
          if (!product || !product.isActive) {
            throw new Error(`"${item.productId}" məhsulu artıq mövcud deyil`)
          }

          let unitPrice = parseFloat(
            (product.salePrice ?? product.basePrice).toString()
          )
          let snapshotSku = product.sku
          let snapshotImage = product.images[0]?.url ?? null

          if (item.variantId) {
            const variant = await tx.productVariant.findUnique({
              where: { id: item.variantId },
              select: {
                id: true,
                sku: true,
                stock: true,
                price: true,
                salePrice: true,
                imageUrl: true,
                isActive: true,
              },
            })
            if (!variant || !variant.isActive) {
              throw new Error(`"${product.name}" variantı artıq mövcud deyil`)
            }
            if (variant.stock < item.quantity) {
              throw new Error(
                `"${product.name}" üçün stokda yalnız ${variant.stock} ədəd var`
              )
            }
            // Stoku transaction içində azalt — race condition-u önlə
            await tx.productVariant.update({
              where: { id: variant.id },
              data: { stock: { decrement: item.quantity } },
            })

            const vPrice =
              variant.salePrice ?? variant.price ?? product.salePrice ?? product.basePrice
            unitPrice = parseFloat(vPrice.toString())
            snapshotSku = variant.sku
            snapshotImage = variant.imageUrl ?? snapshotImage
          }

          const lineTotal = unitPrice * item.quantity
          subtotal += lineTotal

          orderItemsData.push({
            productId: product.id,
            variantId: item.variantId ?? null,
            name: product.name,
            sku: snapshotSku,
            imageUrl: snapshotImage,
            price: unitPrice,
            quantity: item.quantity,
            total: lineTotal,
          })
        }

        const shippingCost = SHIPPING_COST
        const total = subtotal + shippingCost

        // Çatdırılma ünvanı və qeyd — sərbəst mətn kimi notes-da saxlanır
        const notesParts: string[] = []
        if (data.addressText) notesParts.push(`Ünvan: ${data.addressText}`)
        if (data.notes) notesParts.push(`Qeyd: ${data.notes}`)
        const combinedNotes = notesParts.length ? notesParts.join('\n') : null

        const newOrder = await tx.order.create({
          data: {
            userId: user?.id ?? null,
            status: 'PENDING',
            paymentStatus: 'UNPAID',
            paymentMethod: data.paymentMethod,
            subtotal,
            shippingCost,
            total,
            notes: combinedNotes,
            // Ad və telefon hər iki halda saxlanır (sadə əlaqə)
            guestName: data.name,
            guestPhone: data.phone,
            guestEmail: null,
            items: {
              createMany: { data: orderItemsData },
            },
          },
          select: { id: true, orderNumber: true, total: true },
        })

        // Səbəti təmizlə
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

        return newOrder
      },
      {
        isolationLevel: 'Serializable',
        timeout: 15000,
      }
    )

    return NextResponse.json({ data: order }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('stok')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return handleApiError(error)
  }
}
