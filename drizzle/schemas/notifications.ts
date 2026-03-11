import { index, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses";
import { clients } from "./clients";
import { appointments } from "./appointments";
import { relations } from "drizzle-orm/relations";

export const notificationTypeEnum = pgEnum('notification_type', ['sms', 'email', 'whatsapp']);
export const notificationStatusEnum = pgEnum('notification_status', ['pending', 'sent', 'failed']);

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'cascade' }),
  appointmentId: uuid('appointment_id').references(() => appointments.id, { onDelete: 'set null' }),
  type: notificationTypeEnum('type').notNull(),
  status: notificationStatusEnum('status').default('pending'),
  to: varchar('to', { length: 255 }).notNull(), // phone number or email
  subject: varchar('subject', { length: 255 }), // за имейли
  content: text('content').notNull(),
  scheduledFor: timestamp('scheduled_for'),
  sentAt: timestamp('sent_at'),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  businessIdx: index('notification_business_idx').on(table.businessId),
  scheduledIdx: index('notification_scheduled_idx').on(table.scheduledFor),
  statusIdx: index('notification_status_idx').on(table.status),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  business: one(businesses, {
    fields: [notifications.businessId],
    references: [businesses.id],
  }),
  client: one(clients, {
    fields: [notifications.clientId],
    references: [clients.id],
  }),
  appointment: one(appointments, {
    fields: [notifications.appointmentId],
    references: [appointments.id],
  }),
}));