import { boolean, decimal, index, jsonb, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses";

export const subscriptionTierEnum = pgEnum('subscription_tier', ['basic', 'pro', 'enterprise']);

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  tier: subscriptionTierEnum('tier').notNull(),
  status: varchar('status', { length: 50 }).notNull(), // active, past_due, canceled, etc.
  pricePerMonth: decimal('price_per_month', { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  trialEndsAt: timestamp('trial_ends_at'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  paymentMethod: jsonb('payment_method'),
  invoiceSettings: jsonb('invoice_settings'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  businessIdx: index('subscription_business_idx').on(table.businessId),
  stripeCustomerIdx: index('subscription_stripe_customer_idx').on(table.stripeCustomerId),
}));