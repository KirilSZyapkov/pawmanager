import { index, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { staff } from "../schema";

export const ownerSessions = pgTable("owner_sessions", {
    id: uuid("id").defaultRandom().primaryKey(),

    staffId: uuid("staff_id")
        .references(() => staff.id)
        .notNull(),

    token: text("token").notNull().unique(),

    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
})