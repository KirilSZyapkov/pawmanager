import { index, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar, boolean } from "drizzle-orm/pg-core";
import { businesses } from "./businesses";
import { notificationTypeEnum } from "./notifications";
import { relations } from "drizzle-orm/relations";

export const reminderTemplates = pgTable('reminder_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // appointment_reminder, birthday, etc.
  channel: notificationTypeEnum('channel').notNull(), // sms, email
  subject: varchar('subject', { length: 255 }), // за имейли
  content: text('content').notNull(),
  sendWhen: jsonb('send_when').notNull(), // {"before": 60, "unit": "minutes"} или {"at": "09:00"}
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  businessIdx: index('template_business_idx').on(table.businessId),
}));

export const reminderTemplatesRelations = relations(reminderTemplates, ({ one }) => ({
  business: one(businesses, {
    fields: [reminderTemplates.businessId],
    references: [businesses.id],
  }),
}));