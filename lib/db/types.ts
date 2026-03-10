import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import * as schema from '../../drizzle/schema';

// Business types
export type Business = InferSelectModel<typeof schema.businesses>;
export type NewBusiness = InferInsertModel<typeof schema.businesses>;

// Staff types
export type Staff = InferSelectModel<typeof schema.staff>;
export type NewStaff = InferInsertModel<typeof schema.staff>;

// Client types
export type Client = InferSelectModel<typeof schema.clients>;
export type NewClient = InferInsertModel<typeof schema.clients>;

// Pet types
export type Pet = InferSelectModel<typeof schema.pets>;
export type NewPet = InferInsertModel<typeof schema.pets>;

// Service types
export type Service = InferSelectModel<typeof schema.services>;
export type NewService = InferInsertModel<typeof schema.services>;

// Appointment types
export type Appointment = InferSelectModel<typeof schema.appointments>;
export type NewAppointment = InferInsertModel<typeof schema.appointments>;

// Photo types
export type Photo = InferSelectModel<typeof schema.photos>;
export type NewPhoto = InferInsertModel<typeof schema.photos>;

// Payment types
export type Payment = InferSelectModel<typeof schema.payments>;
export type NewPayment = InferInsertModel<typeof schema.payments>;

// Subscription types
export type Subscription = InferSelectModel<typeof schema.subscriptions>;
export type NewSubscription = InferInsertModel<typeof schema.subscriptions>;

// Notification types
export type Notification = InferSelectModel<typeof schema.notifications>;
export type NewNotification = InferInsertModel<typeof schema.notifications>;

// ReminderTemplate types
export type ReminderTemplate = InferSelectModel<typeof schema.reminderTemplates>;
export type NewReminderTemplate = InferInsertModel<typeof schema.reminderTemplates>;