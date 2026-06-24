// Layihə üçün ümumi tiplər
import type {
  Product,
  ProductImage,
  ProductVariant,
  AttributeValue,
  AttributeType,
  Category,
} from '@prisma/client'

export type ProductSummary = Pick<
  Product,
  'id' | 'name' | 'slug' | 'shortDesc' | 'basePrice' | 'salePrice' | 'isFeatured'
> & {
  images: Pick<ProductImage, 'url' | 'altText'>[]
}

export type ProductWithVariants = Product & {
  images: ProductImage[]
  category: Category
  variants: (ProductVariant & {
    attributes: (AttributeValue & { attributeType: AttributeType })[]
  })[]
}

// Variant matrisi — rəng × ölçü kombinasiyaları
export interface VariantMatrixCell {
  variantId: string
  stock: number
  price: number
  imageUrl?: string
}

export interface VariantMatrix {
  [colorId: string]: {
    [sizeId: string]: VariantMatrixCell
  }
}

// API response tipləri
export interface ApiError {
  error: string
  details?: unknown
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
