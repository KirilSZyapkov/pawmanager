import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().max(50),
  duration: z.number().min(5).max(480), // минути
  price: z.number().min(0).max(10000),
  priceForSize: z.record(z.enum(['tiny', 'small', 'medium', 'large', 'xlarge']), z.number()).optional(),
  isActive: z.boolean().default(true),
  color: z.string().max(20).optional(),
});