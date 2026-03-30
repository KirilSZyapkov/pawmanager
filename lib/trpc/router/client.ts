import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, businessProcedure, clientProcedure, publicProcedure } from '../trpc';
import db from '@/drizzle/db';
import { clients } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { registerClientSchema } from '@/lib/validators/client';

import { SQL } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const clientRouter = router({
  getAllClientsRecords: businessProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0)
      })
    )
    .query(
      async ({ ctx, input }) => {
        if (!ctx.session?.user?.businessId) {
          throw new TRPCError({
            code: "UNAUTHORIZED"
          });
        };
        const businessId = ctx.session.user.businessId;
        let query = await db.query.clients.findMany({
          where: (clients, { eq, and, or, ilike }) => {
            const conditions = [
              eq(clients.businessId, businessId),
              input.search
                ? or(
                  ilike(clients.name, `%${input.search}%`),
                  ilike(clients.phone, `%${input.search}%`),
                  ilike(clients.email, `%${input.search}%`)
                )
                : undefined

            ].filter((c): c is SQL => c !== undefined);
            return and(...conditions)
          },
          //TODO...
          // whith: {
          //     pets: true
          // },

          orderBy: (clients, { desc }) => [desc(clients.createdAt)],
          limit: input.limit,
          offset: input.offset
        });

        return query;
      }
    ),

  getClientRecordById: businessProcedure
    .input(z.object({ id: z.uuid() }))
    .query(
      async ({ ctx, input }) => {
        const client = await db.query.clients.findFirst({
          where: (clients, { eq, and }) =>
            and(
              eq(clients.id, input.id),
              eq(clients.businessId, ctx.session?.user.businessId!)
            ),

          with: {
            pets: {
              with: {
                appointments: {
                  orderBy: (appointments, { desc }) => [desc(appointments.startTime)],
                  with: {
                    service: true
                  },
                },
                photos: {
                  limit: 3
                }
              }
            },
            //TODO...
            // payments:{
            //     limit: 10,
            //     orderBy: (payments, { desc }) => [desc(payments.createdAt)],
            // },

            // notifications: {
            //     limit: 10,
            //     orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
            // },
          },

        })
        if (!client) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Client is not found.',
          });
        };

        return client;
      }
    ),

  clientLogin: publicProcedure
    .input(
      z.object({
        phone: z.string().min(10, "Phone number must be at least 10 characters long"),
        password: z.string().min(6, "Password must be at least 6 characters long"),
      })
    )
    .mutation(async ({ input }) => {
      // Check if the client exists
      const client = await db.query.clients.findFirst({
        where: (clients, { eq }) => eq(clients.phone, input.phone),
      });

      if (!client || !client.password) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials"
        })
      };

      const validPassword = await bcrypt.compare(input.password, client.password);

      if (!validPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      return client;
    }),

  registerClientPublic: publicProcedure
    .input(registerClientSchema)
    .mutation(
      async ({ input }) => {
        const business = await db.query.businesses.findFirst({
          where: (businesses, { eq }) => eq(businesses.slug, input.businessSlug)
        });

        if (!business) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business not found",
          });
        };

        const existingClient = await db.query.clients.findFirst({
          where: (clients, { eq, and }) =>
            and(
              eq(clients.phone, input.phone),
              eq(clients.businessId, business.id)
            )
        });

        if (existingClient) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Client already exists",
          });
        };

        const hashedPassword = await bcrypt.hash(input.password, 10);

        const [client] = await db.insert(clients).values({
          businessId: business.id!,
          name: input.name,
          phone: input.phone,
          email: input.email!,
          businessSlug: input.businessSlug,
          password: hashedPassword,
        }).returning();

        return {
          success: true,
          clientId: client.id
        }
      }
    ),


  updateClientRecord: businessProcedure
    .input(z.object({ id: z.uuid(), data: registerClientSchema.partial() }))
    .mutation(
      async ({ ctx, input }) => {
        const [updated] = await db.update(clients)
          .set({
            ...input.data,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(clients.id, input.id),
              eq(clients.businessId, ctx.session?.user.businessId!)
            )
          )
          .returning();

        return updated;
      }
    ),

  deleteClientRecord: businessProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(
      async ({ ctx, input }) => {
        const [deleted] = await db.delete(clients)
          .where(
            and(
              eq(clients.id, input.id),
              eq(clients.businessId, ctx.session?.user.businessId!)
            )
          )
          .returning();

        return deleted;
      }
    )//end mutatioin


































})