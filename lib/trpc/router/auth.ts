import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import db from "@/drizzle/db";
import { registerBusinessSchema } from "@/lib/validators/business";
import bcrypt from 'bcryptjs';
import { businesses, clients, pets, staff } from "@/drizzle/schema";
import { staffSchema } from "@/lib/validators/staff";

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
      const existingBusiness = await db.query.businesses.findFirst({
        where: (businesses, { eq, or }) => or(eq(businesses.email, input.email), eq(businesses.phone, input.phone))
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
        password: hashedPassword,
        email: input.email,
        phone: input.phone,
        address: input.address,
        city: input.city,
        status: 'trial',
        subscriptionTier: 'basic',
        subscriptionEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 дни trial
        maxStaff: 3,
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
        password: hashedPassword,
        email: input.email,
        name: input.ownerName,
        phone: input.phone,
        role: 'owner',
        isActive: true,
        workingDays: [1, 2, 3, 4, 5], // Понеделник - Петък
        workingHours: { start: '09:00', end: '18:00' },
      }).returning();


      return {
        success: true,
        businessId: business.id,
        message: "Business successfuly created."
      }
    }),

  registerNewStaffMember: protectedProcedure
    .input(staffSchema)
    .mutation(
      async ({ ctx, input }) => {

        if (ctx.session?.user.role !== 'owner') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permtions to registert staff member.',
          });
        };

        const existingStaffMember = await db.query.staff.findFirst({
          where: (staff, { eq, and }) =>
            and(
              eq(staff.email, input.email),
              eq(staff.businessId, ctx.session?.user.businessId!)
            )
        });

        if (existingStaffMember) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Staff member already exist.',
          });
        };

        // Провери лимита за служители
        const business = await db.query.businesses.findFirst({
          where: (businesses, { eq }) => eq(businesses.id, ctx.session?.user.businessId!)
        });

        const staffCount = await db.query.staff.findMany({
          where: (staff, { eq }) => eq(staff.businessId, ctx.session?.user.businessId!)
        });

        if (staffCount.length >= (business?.maxStaff || 3)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Reached limit.',
          });
        };

        const hashedPassword = await bcrypt.hash(input.password, 10);

        const [staffMember] = await db
          .insert(staff)
          .values({
            businessId: ctx.session.user.businessId!,
            password: hashedPassword,
            email: input.email,
            name: input.name,
            phone: input.phone,
            role: input.role,
            isActive: true,
            specialties: input.specialties,
            workingDays: input.workingDays,
            workingHours: input.workingHours,
            commission: input.commission,
          })
          .returning();

        return {
          success: true,
          staffId: staffMember.id,
          message: "Staff member register successfuly."
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
    .mutation(async ({ input }) => {
      // Check if the client exists
      const client = await db.query.clients.findFirst({
        where: (clients, { eq }) => eq(clients.phone, input.phone),
      });

      if (!client) {
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
      .mutation(async ({ input }) => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        // да запиша кода в базата данни и да го изпратя на клиента чрез СМС
        return { success: true };
      })
})
