import { index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { subscriptionTierEnum } from "./subscriptions";

export const businessStatusEnum = pgEnum('business_status', ['active', 'suspended', 'trial', 'cancelled']);

export const businesses = pgTable('businesses', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }).notNull(),
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 50 }),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 50 }).default('Bulgaria'),
  logo: text('logo'),
  website: varchar('website', { length: 255 }),
  timezone: varchar('timezone', { length: 50 }).default('Europe/Sofia'),
  status: businessStatusEnum('status').default('trial'),
  subscriptionTier: subscriptionTierEnum('subscription_tier').default('basic'),
  subscriptionEndsAt: timestamp('subscription_ends_at'),
  maxStaff: integer('max_staff').default(1),
  maxClients: integer('max_clients').default(100),
  smsCredits: integer('sms_credits').default(0),
  settings: jsonb('settings').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: uniqueIndex('business_email_idx').on(table.email),
  cityIdx: index('business_city_idx').on(table.city),
}));