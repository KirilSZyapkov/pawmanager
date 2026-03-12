import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../trpc";
import db from "@/drizzle/db";

export const authRouter = router({
  // Get the current user's session
  getCurrentSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),

  // register a new business
  registerNewBusibess: publicProcedure
    .input(
      z.object({
        businessName: z.string().min(2, "Business name must be at least 2 characters long"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters long"),
        phoneNumber: z.string().min(10, "Phone number must be at least 10 characters long"),
      })
    )
    .mutation(async ({ input }) => {
      // да интегрирам NextAuth
      return { success: true }
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