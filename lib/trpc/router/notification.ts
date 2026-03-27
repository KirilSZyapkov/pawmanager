import {z} from 'zod';
import { TRPCError } from '@trpc/server';
import {router, businessProcedure} from '../trpc';
import db from '@/drizzle/db';
import { notificationSchema } from '@/lib/validators/notification';
import { notifications } from '@/drizzle/schema';


export const notificationRouter = router({

listAllNotifications: businessProcedure
.input(
  z.object({
    status: z.enum(['pending', 'sent', 'failed']).optional(),
    type: z.enum(['sms', 'email', 'whatsapp']).optional(),
    limit: z.number().min(1).max(100).default(50),
    offset: z.number().min(0).default(0)
  })
)
.query(
  async ({ctx, input})=>{
    let query = await db.query.notifications.findMany({
      where: (notifications, {and, eq})=>{
        const conditions = [eq(notifications.businessId, ctx.session?.user.businessId!)];

        if(input.status) {
          conditions.push(eq(notifications.status, input.status))
        };

        if(input.type) {
          conditions.push(eq(notifications.type, input.type))
        };

        return and(...conditions);
      },
      with:{
        client: true,
        appointment: {
          with:{
            pet: true
          }
        }
      },
      orderBy: (notifications, {desc})=>[desc(notifications.createdAt)],
      limit: input.limit,
      offset: input.offset
    })
    return query;
  }
),

createNewNotification: businessProcedure
.input(notificationSchema)
.mutation(
  async({ctx, input})=>{
    const [notification] = await db.insert(notifications)
    .values({
      ...input,
      businessId: ctx.session?.user.businessId!,
      status: 'pending'
    }).returning();

    if(!input.scheduledFor){
      //TODO... да добавя изпращане на нотификация
      return null;
    }

    return notification;
  }
)//end mutation







































})