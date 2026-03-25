import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, businessProcedure, clientProcedure } from '../trpc';
import { db } from '@/lib/db';
import { clients, pets } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { registerClientSchema } from '@/lib/validators/auth';
import { appointments, businesses, photos } from '@/drizzle/schema';
import { payments } from '@/drizzle/schemas/payments';

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
        async ({ctx, input})=>{
            let query = await db.query.clients.findMany({
                where:(clients, {eq, and, or, ilike})=>{
                    const conditions = [eq(clients.businessId, ctx.businesses.id)];

                    if(input.search){
                        conditions.push(
                            or(
                               ilike(clients.name, `%${input.search}%`),
                               ilike(clients.phone, `%${input.search}%`),
                               ilike(clients.email, `%${input.search}%`)
                            )
                        )
                    };

                    return and(...conditions)
                },

                whith: {
                    pets: true
                },

                orderBy: (clients, {desc})=> [desc(clients.createdAt)],
                limit: input.limit,
                offset: input.offset
            });

            return query;
        }
    ),

    getClientRecordById: businessProcedure
    .input(z.object({id: z.uuid()}))
    .query(
        async ({ctx, input})=>{
            const client = await db.query.clients.findFirst({
                where: (clients, {eq, and})=>
                    and(
                        eq(clients.id, input.id),
                        eq(clients.businessId, ctx.businesses.id)
                    ),

                    with: {
                        pets:{
                            with:{
                                appointments:{
                                    orderBy: (appointments, {desc})=>[desc(businesses.startTime)],
                                    with: {
                                        service: true
                                    },
                                },
                                photos: {
                                    limit: 3
                                }
                            }
                        }
                        payments:{
                            limit: 10,
                            orderBy: (payments, { desc }) => [desc(payments.createdAt)],
                        },
    
                        notifications: {
                            limit: 10,
                            orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
                        },
                    },

            })
            if(!client){
                throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Client is not found.',
                });
            };

            return client;
        }
    )





































})