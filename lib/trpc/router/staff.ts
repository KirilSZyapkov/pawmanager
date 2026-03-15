import { z } from "zod";
import { TRPCError } from '@trpc/server';
import { router, businessProcedure } from '../trpc';
import db from '@/drizzle/db';
import { eq, and } from 'drizzle-orm';
import { staffSchema } from '@/lib/validators/staff';
import { appointments, staff } from "@/drizzle/schema";

export const staffRouter = router({

  listAllStaff: businessProcedure.query(async ({ ctx }) => {
    return await db.query.staff.findMany({
      where: (staff, { eq }) => eq(staff.businessId, ctx.business.id),
      orderBy: (staff, { asc }) => [asc(staff.name)]
    })
  }),

  getById: businessProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const employee = await db.query.staff.findFirst({
        where: (staff, { eq, and }) =>
          and(
            eq(staff.id, input.id),
            eq(staff.businessId, ctx.business.id)
          ),
        with: {
          appointments: {
            limit: 10,
            orderBy: (appointments, { desc }) => [desc(appointments.startTime)]
          }
        }
      });

      if (!employee) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Employee not found' });
      };

      return employee;
    }),

  createNewEmployee: businessProcedure
    .input(staffSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await db.query.staff.findFirst({
        where: (staff, { eq, and }) =>
          and(
            eq(staff.email, input.email),
            eq(staff.businessId, ctx.business.id)
          )
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Employee already exists"
        });
      };

      const [newEmployee] = await db.insert(staff).values(...input, businessId: ctx.business.id).returning();

      return newEmployee;
    }),

  updateEmployee: businessProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: staffSchema.partial()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db.update(staff).set({ ...input.data, updatedAt: new Date() }).where(and(eq(staff.id, input.id), eq(staff.businessId, ctx.business.id))).returning();
      return updated;
    })
})