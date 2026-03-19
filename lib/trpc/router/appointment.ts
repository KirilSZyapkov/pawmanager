import {z} from "zod";
import {TRPCError} from "@trpc/server";
import {router, businessProcedure} from "../trpc";
import db from "@/drizzle/db";
import {appointmentSchema} from "@/lib/validators/appointment";
import { appointments } from "@/drizzle/schema";

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
        async ({ctx, input})=>{
            let query = db.query.appointments.findMany({
                where: (appointments, {and, eq})=> {
                    const conditions = [eq(appointments.businessId, ctx.business.id)];

                    if(input.startDate && input.endDate){
                        conditions.push(between(appointments.startTime, input.startDate, input.endDate));
                    };

                    if(input.staffId){
                        conditions.push(eq(appointments.staffId, input.staffId));
                    };

                    if(input.petId){
                        conditions.push(eq(appointments.petId, input.petId));
                    };

                    if(input.status){
                        conditions.push(eq(appointments.status, input.status))
                    };

                    return and(...conditions);
                },

                whit: {
                    pet: {
                        with: {
                            client: true,
                        }
                    },
                    service: true,
                    staff: true,
                },

                orderBy: (appointments, {desc})=> [desc(appointments.startTime)],
                limit: input.limit,
                offser: input.offset,
            });

            return query;
        },

        
    )
})