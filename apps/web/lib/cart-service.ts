// Cart üçün ümumi server logic (API endpoint-lərində istifadə olunur)
import { prisma } from './db'
import { getCurrentUser } from './server-auth'
import { ensureCartSessionId, getCartSessionId } from './cart-session'

const cartItemInclude = {
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      basePrice: true,
      salePrice: true,
      images: {
        where: { isPrimary: true },
        take: 1,
        select: { url: true, altText: true },
      },
    },
  },
  variant: {
    select: {
      id: true,
      sku: true,
      price: true,
      salePrice: true,
      stock: true,
      imageUrl: true,
      attributes: {
        select: {
          id: true,
          value: true,
          attributeType: { select: { name: true } },
        },
      },
    },
  },
} as const

// Cart-ı tap və ya yarat (read-only versiyası — yaratmır)
export async function findCart() {
  const user = await getCurrentUser()
  if (user) {
    return prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: cartItemInclude, orderBy: { addedAt: 'asc' } } },
    })
  }
  const sessionId = getCartSessionId()
  if (!sessionId) return null
  return prisma.cart.findUnique({
    where: { sessionId },
    include: { items: { include: cartItemInclude, orderBy: { addedAt: 'asc' } } },
  })
}

// Cart-ı al və ya yarat (yazma əməliyyatları üçün)
export async function getOrCreateCart() {
  const user = await getCurrentUser()
  if (user) {
    const existing = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: cartItemInclude, orderBy: { addedAt: 'asc' } } },
    })
    if (existing) return existing
    return prisma.cart.create({
      data: { userId: user.id },
      include: { items: { include: cartItemInclude, orderBy: { addedAt: 'asc' } } },
    })
  }

  const sessionId = ensureCartSessionId()
  const existing = await prisma.cart.findUnique({
    where: { sessionId },
    include: { items: { include: cartItemInclude, orderBy: { addedAt: 'asc' } } },
  })
  if (existing) return existing
  return prisma.cart.create({
    data: { sessionId },
    include: { items: { include: cartItemInclude, orderBy: { addedAt: 'asc' } } },
  })
}

// Cart-ın bütün item-lərini al
export async function getCartItems() {
  const cart = await findCart()
  return cart?.items ?? []
}
