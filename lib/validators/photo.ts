import { z } from 'zod';

export const photoSchema = z.object({
  appointmentId: z.string().uuid().optional().nullable(),
  petId: z.string().uuid(),
  url: z.string().url(),
  type: z.enum(['before', 'after', 'profile']),
  caption: z.string().optional(),
});