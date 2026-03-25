import { z } from 'zod';

export const staffSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(255),
  phone: z.string().min(10).max(50),
  role: z.enum(['owner', 'admin', 'manager', 'groomer', 'receptionist']),
  avatar: z.string().url().optional().nullable(),
  bio: z.string().optional(),
  specialties: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  workingDays: z.array(z.number().min(0).max(6)),
  workingHours: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  }),
  commission: z.number().min(0).max(100).optional(),
});