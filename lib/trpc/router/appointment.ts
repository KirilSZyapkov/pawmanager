import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, businessProcedure } from "../trpc";
import db from "@/drizzle/db";
import { appointmentSchema } from "@/lib/validators/appointment";
import { appointments } from "@/drizzle/schema";
import { and, between, eq } from "drizzle-orm";

export const appointmentRouter = router({

  listAllAppointments: businessProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        staffId: z.string().optional(),
        petId: z.string().optional(),
        status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
        limit: z.number().optional(),
        offset: z.number().min(0).default(0)
      })
    )
    .query(
      async ({ ctx, input }) => {
        let query = db.query.appointments.findMany({
          where: (appointments, { and, eq }) => {
            const conditions = [eq(appointments.businessId, ctx.business.id)];

            if (input.startDate && input.endDate) {
              conditions.push(between(appointments.startTime, input.startDate, input.endDate));
            };

            if (input.staffId) {
              conditions.push(eq(appointments.staffId, input.staffId));
            };

            if (input.petId) {
              conditions.push(eq(appointments.petId, input.petId));
            };

            if (input.status) {
              conditions.push(eq(appointments.status, input.status))
            };

            return and(...conditions);
          },

          with: {
            pet: {
              with: {
                client: true,
              }
            },
            service: true,
            staff: true,
          },

          orderBy: (appointments, { desc }) => [desc(appointments.startTime)],
          limit: input.limit,
          offset: input.offset,
        });

        return query;
      }),

  getAppointmentById: businessProcedure
    .input(z.object({ id: z.uuid() }))
    .query(
      async ({ ctx, input }) => {
        const appointment = await db.query.appointments.findFirst({
          where: (appointments, { and, eq }) =>
            and(
              eq(appointments.id, input.id),
              eq(appointments.businessId, ctx.business.id)
            ),
          with: {
            pet: {
              with: {
                client: true,
              }
            },
            service: true,
            staff: true,
            photo: true,
            payment: true,
          },
        });

        if (!appointment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Резервацията не е намерена',
          })
        };

        return appointment;
      }),

  createNewAppointment: businessProcedure
    .input(appointmentSchema)
    .mutation(
      async ({ ctx, input }) => {
        const conflictting = await db.query.appointments.findFirst({
          where: (appointments, { and, eq, between }) =>
            and(
              eq(appointments.businessId, ctx.business.id),
              eq(appointments.staffId, input.staffId),
              eq(appointments.status, "confirmed"),
              between(
                appointments.startTime,
                input.startTime,
                input.endTime
              )
            )
        });

        if (conflictting) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Този час вече е зает',
          })
        };

        const [newAppointmentRecord] = await db.insert(appointments).values({ ...input, businessId: ctx.business.id }).returning();

        return newAppointmentRecord;
      }),

  updateAppointmentRecord: businessProcedure
    .input(
      z.object({
        id: z.uuid(),
        data: appointmentSchema.partial(),
      })
    )
    .mutation(
      async ({ ctx, input }) => {
        const [updatedAppointmentRecord] = await db.update(appointments).set({ ...input.data, updatedAt: new Date() })
          .where(
            and(
              eq(appointments.id, input.id),
              eq(appointments.businessId, ctx.business.id)
            )
          )
          .returning();

        return updatedAppointmentRecord;
      }),

  changeAppointmentStatus: businessProcedure
    .input(
      z.object({
        id: z.uuid(),
        status: z.enum(['confirmed', 'completed', 'cancelled', 'no_show']),
        reason: z.string().optional()
      })
    )
    .mutation(
      async ({ ctx, input }) => {
        const rawData = {
          status: input.status,
          updatedAt: new Date(),
        };

        const [updatedAppointmetRecord] = await db.update(appointments)
          .set(rawData)
          .where(
            and(
              eq(appointments.id, input.id),
              eq(appointments.businessId, ctx.business.id)
            )
          )
          .returning();

        return updatedAppointmetRecord;
      }),

  getAvailableSlots: businessProcedure
    .input(
      z.object({
        date: z.date(),
        staffId: z.uuid().optional(),
        serviceId: z.uuid().optional()
      })
    )
    .query(
      async ({ ctx, input }) => {
        const dayStart = new Date(input.date);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(input.date);
        dayEnd.setHours(23, 59, 59, 999);

        const bookedAppointments = await db.query.appointments.findMany({
          where: (appointments, { and, eq, between }) =>
            and(
              eq(appointments.businessId, ctx.business.id),
              eq(appointments.status, "confirmed"),
              between(appointments.startTime, dayStart, dayEnd),
              input.staffId ? eq(appointments.staffId, input.staffId) : undefined
            )
        });

        const staffListRecords = input.staffId ? await db.query.staff.findMany({
          where: (staff, { eq }) => eq(staff.id, input.staffId!),
        })
          : await db.query.staff.findMany({
            where: (staff, { eq, and }) =>
              and(
                eq(staff.businessId, ctx.business.id),
                eq(staff.isActive, true)
              )
          });

        const slots = [];
        for (const staff of staffListRecords) {
          const dayOfWeek = input.date.getDate();
          if (!staff.workingDays?.includes(dayOfWeek)) {
            continue;
          };

          const workingHours = staff.workingHours as any;

          if (!workingHours) continue;

          const [startHours, startMinute] = workingHours.start.split(":").map(Number);
          const [endHour, endMinute] = workingHours.end.split(":").map(Number);

          let currentTime = new Date(input.date);
          currentTime.setHours(startHours, startMinute, 0);

          const endTime = new Date(input.date);
          endTime.setHours(endHour, endMinute, 0);

          while (currentTime < endTime) {
            const slotEnd = new Date(currentTime.getTime() + 30 * 60000); // +30min

            const isBooked = bookedAppointments.some(
              (apt) => apt.staffId === staff.id && apt.startTime < slotEnd && new Date(apt.startTime.getTime() + apt.service?.duratio * 60000) > currentTime
            );

            if (!isBooked) {
              slots.push({
                staffId: staff.id,
                staffName: staff.name,
                startTime: currentTime,
                endTime: slotEnd,
              });
            }

            currentTime = slotEnd;
          }
        }
        return slots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      }
    )
})