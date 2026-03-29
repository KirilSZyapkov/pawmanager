CREATE TYPE "public"."appointment_status" AS ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."business_status" AS ENUM('active', 'suspended', 'trial', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."pet_gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."pet_size" AS ENUM('tiny', 'small', 'medium', 'large', 'xlarge');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('owner', 'admin', 'manager', 'groomer', 'receptionist');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('basic', 'pro', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('pending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('sms', 'email', 'whatsapp');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'refunded', 'failed');--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"pet_id" uuid NOT NULL,
	"service_id" uuid,
	"staff_id" uuid,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"status" "appointment_status" DEFAULT 'pending',
	"price" numeric(10, 2),
	"notes" text,
	"staff_notes" text,
	"is_first_visit" boolean DEFAULT false,
	"reminder_sent" boolean DEFAULT false,
	"reminder_sent_at" timestamp,
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	"cancellation_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"phone" varchar(50) NOT NULL,
	"address" text NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(50),
	"postal_code" varchar(20),
	"country" varchar(50) DEFAULT 'Bulgaria',
	"logo" text,
	"website" varchar(255),
	"timezone" varchar(50) DEFAULT 'Europe/Sofia',
	"status" "business_status" DEFAULT 'trial',
	"subscription_tier" "subscription_tier" DEFAULT 'basic',
	"subscription_ends_at" timestamp,
	"max_staff" integer DEFAULT 3,
	"max_clients" integer DEFAULT 100,
	"sms_credits" integer DEFAULT 0,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "businesses_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"email" varchar(255),
	"name" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"phone" varchar(50) NOT NULL,
	"address" text,
	"city" varchar(100),
	"how_did_you_find_us" varchar(50),
	"birth_date" timestamp,
	"notes" text,
	"sms_consent" boolean DEFAULT false,
	"email_consent" boolean DEFAULT false,
	"total_visits" integer DEFAULT 0,
	"last_visit_at" timestamp,
	"total_spent" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"species" varchar(50) NOT NULL,
	"breed" varchar(100),
	"color" varchar(100),
	"gender" "pet_gender",
	"birth_date" timestamp,
	"approximate_age" integer,
	"weight" numeric(5, 2),
	"size" "pet_size",
	"microchip_number" varchar(50),
	"allergies" text,
	"medications" text,
	"medical_conditions" text,
	"behavior_notes" text,
	"favorite_treats" text,
	"fears" text,
	"profile_photo" text,
	"is_active" boolean DEFAULT true,
	"last_groom_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"appointment_id" uuid,
	"pet_id" uuid NOT NULL,
	"url" text NOT NULL,
	"type" varchar(20),
	"caption" text,
	"uploaded_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(50),
	"duration" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"price_for_size" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"color" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(50),
	"role" "user_role" DEFAULT 'groomer',
	"avatar" text,
	"bio" text,
	"specialties" text[],
	"is_active" boolean DEFAULT true,
	"working_days" integer[],
	"working_hours" jsonb DEFAULT '{}'::jsonb,
	"commission" numeric(5, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"stripe_subscription_id" varchar(255),
	"stripe_customer_id" varchar(255),
	"tier" "subscription_tier" NOT NULL,
	"status" varchar(50) NOT NULL,
	"price_per_month" numeric(10, 2) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"trial_ends_at" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"payment_method" jsonb,
	"invoice_settings" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"client_id" uuid,
	"appointment_id" uuid,
	"type" "notification_type" NOT NULL,
	"status" "notification_status" DEFAULT 'pending',
	"to" varchar(255) NOT NULL,
	"subject" varchar(255),
	"content" text NOT NULL,
	"scheduled_for" timestamp,
	"sent_at" timestamp,
	"error_message" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"appointment_id" uuid,
	"client_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"method" varchar(50) NOT NULL,
	"status" "payment_status" DEFAULT 'pending',
	"stripe_payment_intent_id" varchar(255),
	"stripe_invoice_id" varchar(255),
	"notes" text,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reminder_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"channel" "notification_type" NOT NULL,
	"subject" varchar(255),
	"content" text NOT NULL,
	"send_when" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets" ADD CONSTRAINT "pets_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets" ADD CONSTRAINT "pets_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminder_templates" ADD CONSTRAINT "reminder_templates_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointment_business_date_idx" ON "appointments" USING btree ("business_id","start_time");--> statement-breakpoint
CREATE INDEX "appointment_staff_date_idx" ON "appointments" USING btree ("staff_id","start_time");--> statement-breakpoint
CREATE INDEX "appointment_pet_idx" ON "appointments" USING btree ("pet_id");--> statement-breakpoint
CREATE INDEX "appointment_status_idx" ON "appointments" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "business_email_idx" ON "businesses" USING btree ("email");--> statement-breakpoint
CREATE INDEX "business_city_idx" ON "businesses" USING btree ("city");--> statement-breakpoint
CREATE INDEX "pet_client_idx" ON "pets" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "pet_business_idx" ON "pets" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "photo_pet_idx" ON "photos" USING btree ("pet_id");--> statement-breakpoint
CREATE INDEX "photo_appointment_idx" ON "photos" USING btree ("appointment_id");--> statement-breakpoint
CREATE INDEX "service_business_idx" ON "services" USING btree ("business_id");--> statement-breakpoint
CREATE UNIQUE INDEX "staff_business_email_idx" ON "staff" USING btree ("business_id","email");--> statement-breakpoint
CREATE INDEX "subscription_business_idx" ON "subscriptions" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "subscription_stripe_customer_idx" ON "subscriptions" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "notification_business_idx" ON "notifications" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "notification_scheduled_idx" ON "notifications" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "notification_status_idx" ON "notifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payment_business_idx" ON "payments" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "payment_appointment_idx" ON "payments" USING btree ("appointment_id");--> statement-breakpoint
CREATE INDEX "template_business_idx" ON "reminder_templates" USING btree ("business_id");