import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../trpc";
import db from "@/drizzle/db";
import { registerBusinessSchema } from "@/lib/validators/business";
import bcrypt from 'bcryptjs';
import { businesses, staff } from "@/drizzle/schema";

export const authRouter = router({
  // Get the current user's session
  getCurrentSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),

  // register a new business
  registerNewBusibess: publicProcedure
    .input(
      registerBusinessSchema
    )
    .mutation(async ({ input }) => {
      const existingBusiness = await db.query.business.findFirst({
        where: (businesses,{eq, or}) => or(eq(businesses.email, input.email), eq(businesses.phone, input.phone))
      });

      if (existingBusiness) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Business already exist!',
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const [business] = await db.insert(businesses).values({
        name: input.businessName,
          email: input.email,
          phone: input.phone,
          address: input.address,
          city: input.city,
          status: 'trial',
          subscriptionTier: 'basic',
          subscriptionEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 дни trial
          maxStaff: 1,
          maxClients: 100,
          smsCredits: 50,
          settings: {
            timezone: 'Europe/Sofia',
            currency: 'BGN',
            appointmentReminderHours: 24,
          },
      }).returning();

      const [owner] = await db.insert(staff).values({
          businessId: business.id,
          email: input.email,
          name: input.ownerName,
          phone: input.phone,
          role: 'owner',
          isActive: true,
          workingDays: [1, 2, 3, 4, 5], // Понеделник - Петък
          workingHours: { start: '09:00', end: '18:00' },
      }).returning();


      return { 
        success: true ,
        businessId: business.id,
        message: "Business successfuly created."
      }
    }),

  // login client

  clientLogin: publicProcedure
    .input(
      z.object({
        phone: z.string().min(10, "Phone number must be at least 10 characters long"),
        code: z.string().min(6, "Code must be at least 6 characters long"),
      })
    )
    .mutation(async({input})=>{
      // Check if the client exists
      const client = await db.query.clients.findFirst({
        where: (clients, {eq})=> eq(clients.phone, input.phone),
      });

      if(!client){
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found"
        })
      };

      // да верифицирам СМС кода
      return client;
    }),

    sendClientSMSCode: publicProcedure
    .input(
      z.object({
        phone: z.string().min(10, "Phone number must be at least 10 characters long"),
      })
    )
    .mutation(async ({input})=>{
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      // да запиша кода в базата данни и да го изпратя на клиента чрез СМС
      return { success: true };
    })
})