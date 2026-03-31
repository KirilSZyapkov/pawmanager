import crypto from "crypto";
import db from "@/drizzle/db";
import { ownerSessions } from "@/drizzle/schemas/ownerSessions";

export async function createOwnerSession(userId: string) {
    const token = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Session expires in 30 days

    await db.insert(ownerSessions).values({
        staffId: userId,
        token,
        expiresAt
    });

    return token;
}