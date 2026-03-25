import { z } from 'zod';

export const notificationSchema = z.object({
  clientId: z.string().uuid().optional().nullable(),
  appointmentId: z.string().uuid().optional().nullable(),
  type: z.enum(['sms', 'email', 'whatsapp']),
  to: z.string().max(255),
  subject: z.string().max(255).optional(),
  content: z.string(),
  scheduledFor: z.date().optional(),
  metadata: z.record(z.any()).optional(),
});

export const reminderTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['appointment_reminder', 'birthday', 'follow_up', 'custom']),
  channel: z.enum(['sms', 'email']),
  subject: z.string().max(255).optional(),
  content: z.string(),
  sendWhen: z.object({
    before: z.number().optional(),
    unit: z.enum(['minutes', 'hours', 'days']).optional(),
    at: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  }),
  isActive: z.boolean().default(true),
});