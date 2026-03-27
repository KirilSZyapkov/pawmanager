import { router } from '../trpc';
import { authRouter } from './auth';
import { businessRouter } from './business';
import { staffRouter } from './staff';
import { clientRouter } from './client';
import { petRouter } from './pet';
import { serviceRouter } from './service';
import { appointmentRouter } from './appointment';
import { photoRouter } from './photo';
import { paymentRouter } from './payment';
import { notificationRouter } from './notification';
import { dashboardRouter } from './dashboard';

export const appRouter = router({
  auth: authRouter,
  business: businessRouter,
  staff: staffRouter,
  client: clientRouter,
  pet: petRouter,
  service: serviceRouter,
  appointment: appointmentRouter,
  photo: photoRouter,
  payment: paymentRouter,
  notification: notificationRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;