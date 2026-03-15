import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, businessProcedure } from "../trpc";
import db from "@/drizzle/db";
import { appointments, businesses, clients, staff } from "@/drizzle/schema";
import { businessSchema } from "@/lib/validators/business";
import { eq } from "drizzle-orm";

export const businessRouter = router({

  getProfile: businessProcedure.query(async ({ ctx }) => {
    return ctx.business;
  }),

  updateProfile: businessProcedure
    .input(businessSchema.partial())
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db.update(businesses).set({ ...input, updatedAt: new Date() })
        .where(eq(businesses.id, ctx.business.id))
        .returning();

      return updated;
    }),

  getDashboardStats: businessProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAppointments = await db.query.appointments.findMany({
      where: (appointments, { eq, and, gte, lt }) =>
        and(
          eq(appointments.businessId, ctx.business.id),
          gte(appointments.startTime, today),
          lt(appointments.startTime, new Date(today.getTime() + 24 * 60 * 60 * 1000))
        ),
    });

    const totalClients = await db.query.clients.findMany({
      where: (clients, { eq }) => eq(clients.businessId, ctx.business.id),
    });

  }),

})