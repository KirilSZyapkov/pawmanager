import { z } from 'zod';

export const petRegistrationSchema = z.object({
  name: z.string().min(1, 'Името на любимеца е задължително'),
  species: z.string().min(1, 'Видът на любимеца е задължителен'),
  breed: z.string().optional(),
  color: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  birthDate: z.date().optional(),
  weight: z.number().positive().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  medicalConditions: z.string().optional(),
  behaviorNotes: z.string().optional(),
});