import { z } from 'zod';

export const registerClientSchema = z.object({
  name: z.string().min(2, 'Името трябва да е поне 2 символа'),
  email: z.email('Невалиден имейл адрес').min(5, 'Имейлът трябва да е поне 5 символа'),
  password: z.string().min(8, 'Паролата трябва да е поне 8 символа'),
  phone: z.string().min(10, 'Невалиден телефонен номер'),
  businessSlug: z.string().min(6),
  address: z.string().optional(),
  city: z.string().optional(),
  howDidYouFindUs: z.string().optional(),
  notes: z.string().optional(),
  smsConsent: z.boolean().default(true),
  emailConsent: z.boolean().default(false),
});

export type RegisterClientPublicInput = z.infer<typeof registerClientSchema>;