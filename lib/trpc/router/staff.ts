import { z } from "zod";
import { TRPCError } from '@trpc/server';
import { router, businessProcedure } from '../trpc';
import db from '@/drizzle/db';
import { eq, and } from 'drizzle-orm';
import { staffSchema } from '@/lib/validators/staff';
import { appointments } from "@/drizzle/schema";

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
    })
})