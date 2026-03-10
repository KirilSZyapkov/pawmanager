import { boolean, decimal, index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { businesses } from "./businesses";
import { pets } from "./pets";
import { services } from "./services";
import { staff } from "./staff";

export const appointmentStatusEnum = pgEnum('appointment_status', [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
]);

export const appointments = pgTable('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  petId: uuid('pet_id').references(() => pets.id, { onDelete: 'cascade' }).notNull(),
  serviceId: uuid('service_id').references(() => services.id),
  staffId: uuid('staff_id').references(() => staff.id),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: appointmentStatusEnum('status').default('pending'),
  price: decimal('price', { precision: 10, scale: 2 }),
  notes: text('notes'),
  staffNotes: text('staff_notes'), // само за служителите
  isFirstVisit: boolean('is_first_visit').default(false),
  reminderSent: boolean('reminder_sent').default(false),
  reminderSentAt: timestamp('reminder_sent_at'),
  completedAt: timestamp('completed_at'),
  cancelledAt: timestamp('cancelled_at'),
  cancellationReason: text('cancellation_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  businessDateIdx: index('appointment_business_date_idx').on(table.businessId, table.startTime),
  staffDateIdx: index('appointment_staff_date_idx').on(table.staffId, table.startTime),
  petIdx: index('appointment_pet_idx').on(table.petId),
  statusIdx: index('appointment_status_idx').on(table.status),
}));
