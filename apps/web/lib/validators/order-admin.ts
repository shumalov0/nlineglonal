import { z } from 'zod'

export const orderStatusUpdateSchema = z.object({
  status: z
    .enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'])
    .optional(),
  paymentStatus: z.enum(['UNPAID', 'PAID', 'PARTIAL', 'REFUNDED']).optional(),
  notes: z.string().optional().nullable(),
})

export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>
