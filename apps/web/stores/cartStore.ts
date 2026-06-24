// Cart Zustand store — server cart-ı sinxronlaşdırır
'use client'

import { create } from 'zustand'

export interface CartItem {
  id: string
  productId: string
  variantId: string | null
  quantity: number
  product: {
    id: string
    name: string
    slug: string
    basePrice: string
    salePrice: string | null
    images: { url: string; altText: string | null }[]
  }
  variant: {
    id: string
    sku: string
    price: string | null
    salePrice: string | null
    stock: number
    imageUrl: string | null
    attributes: { id: string; value: string; attributeType: { name: string } }[]
  } | null
}

export interface CartSummary {
  items: CartItem[]
  subtotal: number
  itemCount: number
}

interface CartState {
  items: CartItem[]
  loading: boolean
  isOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  fetch: () => Promise<void>
  add: (productId: string, variantId: string | null, quantity?: number) => Promise<void>
  update: (itemId: string, quantity: number) => Promise<void>
  remove: (itemId: string) => Promise<void>
  clear: () => void
}

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? 'Səhv baş verdi')
  }
  return res.json() as Promise<T>
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  isOpen: false,

  openDrawer: () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false }),
  toggleDrawer: () => set((s) => ({ isOpen: !s.isOpen })),

  fetch: async () => {
    set({ loading: true })
    try {
      const data = await apiCall<{ data: CartItem[] }>('/api/cart')
      set({ items: data.data })
    } catch (e) {
      console.error('[cart fetch]:', e)
    } finally {
      set({ loading: false })
    }
  },

  add: async (productId, variantId, quantity = 1) => {
    const data = await apiCall<{ data: CartItem[] }>('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, variantId, quantity }),
    })
    set({ items: data.data, isOpen: true })
  },

  update: async (itemId, quantity) => {
    if (quantity <= 0) {
      await get().remove(itemId)
      return
    }
    const data = await apiCall<{ data: CartItem[] }>(`/api/cart/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    })
    set({ items: data.data })
  },

  remove: async (itemId) => {
    const data = await apiCall<{ data: CartItem[] }>(`/api/cart/${itemId}`, {
      method: 'DELETE',
    })
    set({ items: data.data })
  },

  clear: () => set({ items: [] }),
}))

// Səbət xülasəsi (effektiv qiymətlərə görə)
export function getCartSummary(items: CartItem[]): CartSummary {
  let subtotal = 0
  let itemCount = 0

  for (const item of items) {
    const variantPrice = item.variant?.salePrice ?? item.variant?.price
    const productPrice = item.product.salePrice ?? item.product.basePrice
    const price = parseFloat(variantPrice ?? productPrice)
    subtotal += price * item.quantity
    itemCount += item.quantity
  }

  return { items, subtotal, itemCount }
}
