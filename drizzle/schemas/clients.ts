import { boolean, decimal, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses";
import { relations } from "drizzle-orm";
import { pets } from "./pets";

export const clients = pgTable('clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  email: varchar('email', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(), // Коригирано
  password: text('password').notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  howDidYouFindUs: varchar('how_did_you_find_us', { length: 50 }),
  birthDate: timestamp('birth_date'),
  notes: text('notes'),
  smsConsent: boolean('sms_consent').default(false),
  emailConsent: boolean('email_consent').default(false),
  totalVisits: integer('total_visits').default(0),
  lastVisitAt: timestamp('last_visit_at'),
  totalSpent: decimal('total_spent', { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const clientsRelations = relations(clients, ({ one, many }) => ({
  business: one(businesses, {
    fields: [clients.businessId],
    references: [businesses.id],
  }),
  pets: many(pets),
  // payments: many(payments), to do
  // notifications: many(notifications), to do
}));