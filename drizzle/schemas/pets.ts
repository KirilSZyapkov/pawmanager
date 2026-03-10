import { boolean, decimal, index, integer, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { clients } from "./clients";
import { businesses } from "./businesses";
import { relations } from "drizzle-orm";
import { appointments } from "./appointments";
import { photos } from "./photos";

export const petSizeEnum = pgEnum('pet_size', ['tiny', 'small', 'medium', 'large', 'xlarge']);
export const petGenderEnum = pgEnum('pet_gender', ['male', 'female']);

export const pets = pgTable('pets', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  species: varchar('species', { length: 50 }).notNull(), // dog, cat, etc.
  breed: varchar('breed', { length: 100 }),
  color: varchar('color', { length: 100 }),
  gender: petGenderEnum('gender'),
  birthDate: timestamp('birth_date'),
  approximateAge: integer('approximate_age'),
  weight: decimal('weight', { precision: 5, scale: 2 }),
  size: petSizeEnum('size'),
  microchipNumber: varchar('microchip_number', { length: 50 }),
  allergies: text('allergies'),
  medications: text('medications'),
  medicalConditions: text('medical_conditions'),
  behaviorNotes: text('behavior_notes'),
  favoriteTreats: text('favorite_treats'),
  fears: text('fears'), // страхове (сешоар, ножици и др.)
  profilePhoto: text('profile_photo'),
  isActive: boolean('is_active').default(true),
  lastGroomAt: timestamp('last_groom_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  clientIdx: index('pet_client_idx').on(table.clientId),
  businessIdx: index('pet_business_idx').on(table.businessId),
}));

export const petsRelations = relations(pets, ({ one, many }) => ({
  client: one(clients, {
    fields: [pets.clientId],
    references: [clients.id],
  }),
  business: one(businesses, {
    fields: [pets.businessId],
    references: [businesses.id],
  }),
  appointments: many(appointments),
  photos: many(photos),
}));