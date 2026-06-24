import { z } from 'zod'

const decimalString = z.union([z.string(), z.number()]).transform((v) =>
  typeof v === 'number' ? v.toString() : v
)

export const productImageSchema = z.object({
  url: z.string().url(),
  key: z.string().optional().nullable(),
  altText: z.string().optional().nullable(),
  sortOrder: z.number().int().nonnegative().default(0),
  isPrimary: z.boolean().default(false),
})

export const productCreateSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional().nullable(),
  shortDesc: z.string().optional().nullable(),
  sku: z.string().min(1),
  categoryId: z.string().min(1),
  basePrice: decimalString,
  salePrice: decimalString.optional().nullable(),
  costPrice: decimalString.optional().nullable(),
  weight: z.number().nonnegative().optional().nullable(),
  dimensions: z
    .object({
      width: z.number().nonnegative(),
      height: z.number().nonnegative(),
      depth: z.number().nonnegative(),
    })
    .optional()
    .nullable(),
  material: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  hasVariants: z.boolean().default(false),
  metaTitle: z.string().optional().nullable(),
  metaDesc: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  images: z.array(productImageSchema).default([]),
})

export const productUpdateSchema = productCreateSchema.partial()

export const variantCreateSchema = z.object({
  sku: z.string().min(1),
  price: decimalString.optional().nullable(),
  salePrice: decimalString.optional().nullable(),
  stock: z.number().int().nonnegative().default(0),
  imageUrl: z.string().url().optional().nullable(),
  imageKey: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().nonnegative().default(0),
  // AttributeValue id-ləri (məs. rəng + ölçü)
  attributeValueIds: z.array(z.string()).min(1),
})

export const variantUpdateSchema = variantCreateSchema.partial()

export type ProductCreateInput = z.infer<typeof productCreateSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
export type VariantCreateInput = z.infer<typeof variantCreateSchema>
export type VariantUpdateInput = z.infer<typeof variantUpdateSchema>
