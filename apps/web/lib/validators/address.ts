import { z } from 'zod'

export const addressCreateSchema = z.object({
  title: z.string().min(1),
  fullName: z.string().min(2),
  phone: z.string().min(5),
  city: z.string().min(2),
  district: z.string().min(2),
  street: z.string().min(2),
  zipCode: z.string().nullable().optional(),
  isDefault: z.boolean().default(false),
})

export const addressUpdateSchema = addressCreateSchema.partial()

export type AddressCreateInput = z.infer<typeof addressCreateSchema>
export type AddressUpdateInput = z.infer<typeof addressUpdateSchema>
