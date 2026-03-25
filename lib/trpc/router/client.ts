import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, businessProcedure, clientProcedure } from '../trpc';
import db from '@/drizzle/db';
import { clients, pets } from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { registerClientSchema } from '@/lib/validators/client';
import { appointments, businesses, photos } from '@/drizzle/schema';
import { payments } from '@/drizzle/schemas/payments';
import { SQL } from 'drizzle-orm';

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

    registerNewClientAdmin: businessProcedure
        .input(registerClientSchema)
        .mutation(
            async ({ ctx, input }) => {
                if (ctx.session?.user.role !== 'owner' && ctx.session?.user.role !== 'staff') {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'You do not have permtions to registert new clients.',
                    });
                };

                const existingClient = await db.query.clients.findFirst({
                    where: (clients, { eq, and }) =>
                        and(
                            eq(clients.phone, input.phone),
                            eq(clients.businessId, ctx.session?.user.businessId!)
                        )
                });

                if (existingClient) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'Client already exist.',
                    });
                };

                const business = await db.query.businesses.findFirst({
                    where: (businesses, { eq }) => eq(businesses?.id, ctx.session?.user.businessId!)
                });

                const clientCount = await db.query.clients.findMany({
                    where: (clients, { eq }) => eq(clients.businessId, ctx.session?.user.businessId!)
                });


                if (clientCount.length >= (business?.maxClients || 100)) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'Reached limit.',
                    });
                };

                const [client] = await db
                    .insert(clients)
                    .values({
                        businessId: ctx.session.user.businessId!,
                        name: input.name,
                        email: input.email,
                        phone: input.phone,
                        address: input.address,
                        city: input.city,
                        howDidYouFindUs: input.howDidYouFindUs,
                        notes: input.notes,
                        smsConsent: input.smsConsent ?? true,
                        emailConsent: input.emailConsent ?? false,
                    })
                    .returning();
                //TODO..
                // if (input.pet) {
                //   await db.insert(pets).values({
                //     businessId: ctx.session.user.businessId!,
                //     clientId: client.id,
                //     name: input.pet.name,
                //     species: input.pet.species,
                //     breed: input.pet.breed,
                //     color: input.pet.color,
                //     gender: input.pet.gender,
                //     birthDate: input.pet.birthDate,
                //     weight: input.pet.weight,
                //     allergies: input.pet.allergies,
                //     medications: input.pet.medications,
                //     medicalConditions: input.pet.medicalConditions,
                //     behaviorNotes: input.pet.behaviorNotes,
                //   });
                // };

                return {
                    success: true,
                    clientId: client.id,
                    message: 'Client registert sucessfuly.'
                };
            }),

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