import { boolean, decimal, index, integer, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses";

export const services = pgTable('services', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }), // grooming, bathing, nail trim, etc.
  duration: integer('duration').notNull(), // в минути
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  priceForSize: jsonb('price_for_size').default({}), // {"small": 30, "medium": 40, "large": 50}
  isActive: boolean('is_active').default(true),
  color: varchar('color', { length: 20 }), // за календара
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  businessIdx: index('service_business_idx').on(table.businessId),
}));