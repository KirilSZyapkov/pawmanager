import { initTRPC, TRPCError } from '@trpc/server';
// import superjson from 'superjson';
import { ZodError } from 'zod';
import type { Context } from './context';
import { clients, staff } from '@/drizzle/schema';
import { ownerSessions } from '@/drizzle/schemas/ownerSessions';

const t = initTRPC.context<Context>().create({
  // transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware за проверка дали потребителят е логнат
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ 
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource.',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.session.user,
    },
  });
});

// Middleware за проверка дали потребителят е собственик на бизнеса
const isBusinessOwner = t.middleware(async({ctx, next})=>{
  if(!ctx.session?.user){
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource.',
    });
  };

  if(ctx.session.user.role !== 'owner'){
    throw new TRPCError({ 
      code: 'FORBIDDEN',
      message: 'You do not have right!'
    });
  };

  const token = getCookie(ctx.req, "owner_session");

  if(!token){
    throw new TRPCError({ code: "UNAUTHORIZED" });
  };

  const session = await ctx.db.query.ownerSession.findFirst({
    where: (ownerSessions, {eq, gt})=> and(eq(ownerSessions.token, token), gt(ownerSessions.expiresAt, new Date())),
    with:{
      user: {
        with: {
          business: true,
        }
      }
    }
  });

  if(!session){
    throw new TRPCError({ code: "UNAUTHORIZED" });
  };

  const business = await ctx.db.query.businesses.findFirst({
    where: (business, {eq })=> eq(business.id, ctx.session?.user.businessId!),
  });

  if(!business){
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'No such business.',
    });
  };

  return next ({
    ctx: {
      ...ctx,
      business,
      session:{
        user: session.user,
      }
    }
  })
});

// Middleware за проверка дали потребителят е служител
const isStaff = t.middleware(async({ctx, next})=>{
  if(!ctx.session?.user){
    throw new TRPCError ({code: 'UNAUTHORIZED',})
  };

  if(ctx.session.user.role !== 'staff' && ctx.session.user.role !== 'owner'){
    throw new TRPCError({ 
      code: 'FORBIDDEN',
      message: 'Staff only!'
    });
  };

  let staffMember = null;

  if(ctx.session.user.role === 'staff'){
    staffMember = await ctx.db.query.staff.findFirst({
      where: (staff, {eq})=> eq(staff.id, ctx.session?.user.id!),
    })
  };

  return next({
    ctx: {
      ...ctx,
      staff: staffMember
    }
  })

});

// Middleware за проверка дали потребителят е клиент
const isClient = t.middleware(async ({ctx, next})=>{
  if(!ctx.session?.user){
    throw new TRPCError ({code: 'UNAUTHORIZED',})
  };

  if(ctx.session.user.role !== 'client'){
    throw new TRPCError({ 
      code: 'FORBIDDEN',
      message: 'Please login!'
    });
  };

  const client = await ctx.db.query.clients.findFirst({
    where: (clients, {eq})=> eq(clients.id, ctx.session?.user.id!)
  });

  if (!client) {
    throw new TRPCError({ 
      code: 'NOT_FOUND',
      message: 'Client not found.'
    });
  };

  if (!client || !client.password) {
    throw new Error("Invalid credentials");
  };  

  return next({
    ctx: {
      ...ctx,
      client
    }
  })

})

export const protectedProcedure = t.procedure.use(isAuthed);
export const businessProcedure = t.procedure.use(isBusinessOwner);
export const staffProcedure = t.procedure.use(isStaff);
export const clientProcedure = t.procedure.use(isClient);