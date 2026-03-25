import { z } from 'zod';

export const appointmentSchema = z.object({
  petId: z.string().uuid(),
  serviceId: z.string().uuid().optional(),
  staffId: z.string().uuid(),
  startTime: z.date(),
  endTime: z.date(),
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).default('pending'),
  price: z.string().min(0),
  notes: z.string().optional(),
  staffNotes: z.string().optional(),
  isFirstVisit: z.boolean().default(false),
});