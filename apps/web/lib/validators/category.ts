import { z } from 'zod'

export const categoryCreateSchema = z.object({
  name: z.string().min(2, 'Ad ən azı 2 simvol olmalıdır'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Yalnız kiçik hərf, rəqəm və "-"'),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  imageKey: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
})

export const categoryUpdateSchema = categoryCreateSchema.partial()

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>
