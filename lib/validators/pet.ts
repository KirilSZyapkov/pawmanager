import { z } from 'zod';

export const petSchema = z.object({
  name: z.string().min(1).max(255),
  species: z.string().min(1).max(50),
  breed: z.string().max(100).optional(),
  color: z.string().max(100).optional(),
  gender: z.enum(['male', 'female']).optional(),
  birthDate: z.date().optional(),
  approximateAge: z.number().min(0).max(50).optional(),
  weight: z.number().min(0).max(200).optional(),
  size: z.enum(['tiny', 'small', 'medium', 'large', 'xlarge']).optional(),
  microchipNumber: z.string().max(50).optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  medicalConditions: z.string().optional(),
  behaviorNotes: z.string().optional(),
  favoriteTreats: z.string().optional(),
  fears: z.string().optional(),
  profilePhoto: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
});