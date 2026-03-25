import { boolean, decimal, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses";
import { relations } from "drizzle-orm";
import { appointments } from "./appointments";
export const userRoleEnum = pgEnum('user_role', ['owner', 'admin', 'manager', 'groomer', 'receptionist']);

export const staff = pgTable('staff', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  password: text('password').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  role: userRoleEnum('role').default('groomer'),
  avatar: text('avatar'),
  bio: text('bio'),
  specialties: text('specialties').array(),
  isActive: boolean('is_active').default(true),
  workingDays: integer('working_days').array(), // 0-6, 0 = понеделник
  workingHours: jsonb('working_hours').default({}), // {"start": "09:00", "end": "18:00"}
  commission: decimal('commission', { precision: 5, scale: 2 }), // процент комисионна
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  businessEmailIdx: uniqueIndex('staff_business_email_idx').on(table.businessId, table.email),
}));

export const staffRelations = relations(staff, ({ one, many }) => ({
  business: one(businesses, {
    fields: [staff.businessId],
    references: [businesses.id],
  }),
  appointments: many(appointments),
}));