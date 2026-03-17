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
  ),

  getPetById: businessProcedure
  .input(z.object({id: z.string().uuid()}))
  .query(
    async ({ctx, input})=>{
      const pet = await db.query.pets.findFirst({
        where: (pets, {eq})=> and(eq(pets.id, input.id), eq(pets.businessId, ctx.business.id)),
        with:{
          client: true,
          appointments: {
            limit: 10,
            orderBy: (appointments, {desc})=> [desc(appointments.startTime)],
            with: {
              service: true,
              staff: true,
            },
          },
          photos: {
            orderBy: (photos, {desc})=> [desc(photos.createdAt)],
          },
        },
      });

      if(!pet){
         throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pet record not found',
        });
      };

      return pet;
    }
  ),


  createNewPetRecord: businessProcedure
  .input(petSchema)
  .mutation(
    async ({ctx, input})=>{
      const [newPetRecord] = await db.insert(pets).values({...input, businessId: ctx.business.id}).returning();
      return newPetRecord;
    }
  ),

  updatePetRecord: businessProcedure
  .input(z.object({
    id: z.string().uuid(),
    data: petSchema.partial(),
  }))
  .mutation(
    async({ctx, input})=>{
      const [updatedPetRecord] = await db.update(pets).set({...input.data, updatedAt: new Date()})
      .where(and(eq(pets.id, input.id), eq(pets.businessId, ctx.business.id)))
      .returning();

      return updatedPetRecord;
    }
  ),

  deletePetRecord: businessProcedure
  .input(z.object({id: z.string().uuid()}))
  .mutation(
    async({ctx, input})=>{
      const [deletedPetRecord] = await db.delete(pets)
      .where(and(eq(pets.id, input.id), eq(pets.businessId, ctx.business.id)))
      .returning();

      return deletedPetRecord;
    }
  )
})