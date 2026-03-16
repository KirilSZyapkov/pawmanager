import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, businessProcedure } from '../trpc';
import db from "@/drizzle/db";
import { pets, appointments, photos } from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { petSchema } from '@/lib/validators/pet';

export const petRouter = router({

  getAllPets: businessProcedure
  .input(
    z.object({
      clientId: z.string().uuid().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0)
    })
  )
  .query(
    async ({ctx, input})=>{
      let query = db.query.pets.findMany({
        where: (pets, {eq, and, or, ilike})=>{
          const conditions = [eq(pets.businessId, ctx.business.id)];

          if(input.clientId){
            conditions.push(eq(pets.clientId, input.clientId));
          }

          if(input.search){
            conditions.push(
              or(
                ilike(pets.name, `%${input.search}%`),
                ilike(pets.breed, `%${input.search}%`)
              )
            )
          }

          return and(...conditions);
        },

        with: {
          client: true,
          photos: {
            limit: 1,
            orderBy: (photos, {desc})=> [desc(photos.createdAt)],
          },
        },
        limit: input.limit,
        offset: input.offset,
      });

      return await query;
    }
  )
})