import { index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses";
import { appointments } from "./appointments";
import { pets } from "./pets";
import { relations } from "drizzle-orm/relations";

export const photos = pgTable('photos', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  appointmentId: uuid('appointment_id').references(() => appointments.id, { onDelete: 'set null' }),
  petId: uuid('pet_id').references(() => pets.id, { onDelete: 'cascade' }).notNull(),
  url: text('url').notNull(),
  type: varchar('type', { length: 20 }), // 'before', 'after', 'profile'
  caption: text('caption'),
  uploadedBy: uuid('uploaded_by'), // staff id
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  petIdx: index('photo_pet_idx').on(table.petId),
  appointmentIdx: index('photo_appointment_idx').on(table.appointmentId),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  business: one(businesses, {
    fields: [photos.businessId],
    references: [businesses.id],
  }),
  appointment: one(appointments, {
    fields: [photos.appointmentId],
    references: [appointments.id],
  }),
  pet: one(pets, {
    fields: [photos.petId],
    references: [pets.id],
  }),
}));