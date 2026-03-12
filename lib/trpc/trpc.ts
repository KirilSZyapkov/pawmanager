import { initTRPC, TRPCError } from '@trpc/server';
// import superjson from 'superjson';
import { ZodError } from 'zod';
import type { Context } from './context';

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

// Middleware за проверка дали потребителят е автентикиран
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ 
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource.',
    });
  }
  return next({
    ctx: {
      session: ctx.session,
      user: ctx.session.user,
    },
  });
});

const isBusinessOwner = t.middleware(async({ctx, next})=>{
  if(!ctx.session?.user){
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource.',
    });
  };

  const staff = await ctx.db.query.staff.findFirst({
    where: (staff, {eq, and})=>
      and(
        eq(staff.email, ctx.session.user.email!),
        eq(staff.role, "owner")
      ),
      with:{
        business: true,
      }
  });

  if(!staff){
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have permission to access this resource.',
    });
  };

  return next ({
    ctx: {
      ...ctx,
      business: staff.business,
      staff,
    }
  })
})

export const protectedProcedure = t.procedure.use(isAuthed);
export const businessProcedure = t.procedure.use(isBusinessOwner);