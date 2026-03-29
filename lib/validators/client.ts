import { z } from 'zod';

export const registerClientSchema = z.object({
  businessId: z.string().uuid().optional(),
  name: z.string().min(2, 'Името трябва да е поне 2 символа'),
  email: z.string().email('Невалиден имейл адрес').optional().nullable(),
  password: z.string().min(8, 'Паролата трябва да е поне 8 символа'),
  phone: z.string().min(10, 'Невалиден телефонен номер'),
  address: z.string().optional(),
  city: z.string().optional(),
  howDidYouFindUs: z.string().optional(),
  notes: z.string().optional(),
  smsConsent: z.boolean().default(true),
  emailConsent: z.boolean().default(false),
});