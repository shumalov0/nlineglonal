import { z } from 'zod'

// Sadələşdirilmiş sifariş — yalnız ad və telefon kifayətdir
export const orderCreateSchema = z.object({
  name: z.string().min(2, 'Ad ən azı 2 simvol olmalıdır'),
  phone: z.string().min(5, 'Telefon nömrəsi düzgün deyil'),
  addressText: z.string().optional().nullable(), // sərbəst mətn (istəyə görə)
  notes: z.string().optional().nullable(),
  paymentMethod: z.enum(['CASH_ON_DELIVERY', 'CARD']).default('CASH_ON_DELIVERY'),
})

export type OrderCreateInput = z.infer<typeof orderCreateSchema>
