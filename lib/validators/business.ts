import { z } from 'zod';

export const businessSettingsSchema = z.object({
  timezone: z.string().default('Europe/Sofia'),
  currency: z.string().default('BGN'),
  appointmentReminderHours: z.number().min(1).max(168).default(24),
  autoConfirmAppointments: z.boolean().default(false),
  allowOnlineBooking: z.boolean().default(true),
  bookingNoticeHours: z.number().min(0).max(168).default(2),
  cancellationPolicyHours: z.number().min(0).max(168).default(24),
  smsReminders: z.boolean().default(true),
  emailReminders: z.boolean().default(true),
});

export const registerBusinessSchema = z.object({
  businessName: z.string().min(2, 'Името на бизнеса трябва да е поне 2 символа'),
  ownerName: z.string().min(2, 'Името на собственика трябва да е поне 2 символа'),
  email: z.string().email('Невалиден имейл адрес'),
  phone: z.string().min(10, 'Невалиден телефонен номер'),
  password: z.string().min(8, 'Паролата трябва да е поне 8 символа'),
  address: z.string().min(5, 'Адресът трябва да е поне 5 символа'),
  city: z.string().min(2, 'Градът трябва да е поне 2 символа'),
  state: z.string().max(50).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(50).default('Bulgaria'),
  logo: z.string().url().optional().nullable(),
  website: z.string().url().max(255).optional().nullable(),
  timezone: z.string().max(50).default('Europe/Sofia'),
});

