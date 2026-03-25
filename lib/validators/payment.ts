import { z } from 'zod';

export const paymentSchema = z.object({
  appointmentId: z.string().uuid().optional().nullable(),
  clientId: z.string().uuid(),
  amount: z.number().min(0),
  method: z.enum(['cash', 'card', 'bank_transfer', 'stripe']),
  status: z.enum(['pending', 'paid', 'refunded', 'failed']).default('pending'),
  stripePaymentIntentId: z.string().max(255).optional(),
  stripeInvoiceId: z.string().max(255).optional(),
  notes: z.string().optional(),
  paidAt: z.date().optional(),
});