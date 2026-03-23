import { z } from 'zod';

export const registerBusinessSchema = z.object({
  businessName: z.string().min(2, 'Името на бизнеса трябва да е поне 2 символа'),
  ownerName: z.string().min(2, 'Името на собственика трябва да е поне 2 символа'),
  email: z.string().email('Невалиден имейл адрес'),
  phone: z.string().min(10, 'Невалиден телефонен номер'),
  password: z.string().min(8, 'Паролата трябва да е поне 8 символа'),
  address: z.string().min(5, 'Адресът трябва да е поне 5 символа'),
  city: z.string().min(2, 'Градът трябва да е поне 2 символа'),
});