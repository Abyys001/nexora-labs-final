CREATE TYPE "public"."admin_role" AS ENUM('owner', 'manager', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."currency_code" AS ENUM('GBP', 'EUR', 'USD');--> statement-breakpoint
CREATE TYPE "public"."currency_source" AS ENUM('provider', 'manual');--> statement-breakpoint
CREATE TYPE "public"."item_complexity" AS ENUM('s', 'm', 'l', 'xl');--> statement-breakpoint
CREATE TYPE "public"."multiplier_group" AS ENUM('complexity', 'timeline', 'scale');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('bank-transfer', 'stripe', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_plan_kind" AS ENUM('full', 'split-completion', 'split-development');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'succeeded', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."price_change_mode" AS ENUM('accept', 'adjust', 'manual');--> statement-breakpoint
CREATE TYPE "public"."pricing_item_kind" AS ENUM('solution', 'feature', 'platform', 'integration', 'ai', 'design', 'support', 'maintenance');--> statement-breakpoint
CREATE TYPE "public"."proposal_status" AS ENUM('draft', 'published', 'accepted', 'superseded', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."schedule_status" AS ENUM('scheduled', 'awaiting', 'paid', 'partially-paid', 'overdue', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"admin_id" uuid,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text,
	"before" jsonb,
	"after" jsonb,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"code" "currency_code" PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"rate" numeric(12, 6) DEFAULT 1 NOT NULL,
	"source" "currency_source" DEFAULT 'manual' NOT NULL,
	"rounding" text DEFAULT 'none' NOT NULL,
	"rate_updated_at" timestamp with time zone,
	"last_refresh_error" text
);
--> statement-breakpoint
CREATE TABLE "exchange_rate_history" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" "currency_code" NOT NULL,
	"rate" numeric(12, 6) NOT NULL,
	"source" "currency_source" NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_plans" (
	"id" uuid PRIMARY KEY NOT NULL,
	"proposal_id" uuid NOT NULL,
	"plan" "payment_plan_kind" NOT NULL,
	"second_due_date" date,
	"cancelled" boolean DEFAULT false NOT NULL,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_plans_proposal_id_unique" UNIQUE("proposal_id")
);
--> statement-breakpoint
CREATE TABLE "payment_schedule_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"plan_id" uuid NOT NULL,
	"sequence" integer NOT NULL,
	"label" text NOT NULL,
	"amount_gbp" integer NOT NULL,
	"amount_in_currency" numeric(14, 2),
	"due_date" date NOT NULL,
	"status" "schedule_status" DEFAULT 'scheduled' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"schedule_item_id" uuid NOT NULL,
	"amount_gbp" integer NOT NULL,
	"amount_in_currency" numeric(14, 2),
	"currency" "currency_code" DEFAULT 'GBP' NOT NULL,
	"method" "payment_method" NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"provider_ref" text,
	"recorded_by" uuid,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_provider_ref_unique" UNIQUE("provider_ref")
);
--> statement-breakpoint
CREATE TABLE "price_changes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"enquiry_id" uuid NOT NULL,
	"admin_id" uuid,
	"previous_gbp" integer,
	"new_gbp" integer NOT NULL,
	"mode" "price_change_mode" NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricing_categories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"category_id" text NOT NULL,
	"label" text NOT NULL,
	"icon" text NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pricing_categories_category_id_unique" UNIQUE("category_id")
);
--> statement-breakpoint
CREATE TABLE "pricing_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"item_id" text NOT NULL,
	"kind" "pricing_item_kind" NOT NULL,
	"category_id" text NOT NULL,
	"label" text NOT NULL,
	"blurb" text DEFAULT '' NOT NULL,
	"icon" text NOT NULL,
	"price" integer NOT NULL,
	"complexity" "item_complexity" NOT NULL,
	"recommends" text[] DEFAULT '{}'::text[] NOT NULL,
	"requires" text[] DEFAULT '{}'::text[] NOT NULL,
	"addons" text[] DEFAULT '{}'::text[] NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pricing_items_item_id_unique" UNIQUE("item_id")
);
--> statement-breakpoint
CREATE TABLE "pricing_multipliers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"group" "multiplier_group" NOT NULL,
	"multiplier_id" text NOT NULL,
	"label" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"multiplier" numeric(6, 4) NOT NULL,
	"weeks" integer,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pricing_multipliers_group_id_unique" UNIQUE("group","multiplier_id")
);
--> statement-breakpoint
CREATE TABLE "pricing_settings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"additional_solution_factor" numeric(4, 3) NOT NULL,
	"range_low" numeric(4, 3) NOT NULL,
	"range_high" numeric(4, 3) NOT NULL,
	"round_to" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" uuid PRIMARY KEY NOT NULL,
	"enquiry_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"status" "proposal_status" DEFAULT 'draft' NOT NULL,
	"automated_estimate_gbp" integer NOT NULL,
	"final_price_gbp" integer NOT NULL,
	"currency" "currency_code" DEFAULT 'GBP' NOT NULL,
	"exchange_rate" numeric(12, 6),
	"rate_recorded_at" timestamp with time zone,
	"amount_in_currency" numeric(14, 2),
	"content" jsonb NOT NULL,
	"valid_until" date,
	"created_by" uuid,
	"published_at" timestamp with time zone,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "role" "admin_role" DEFAULT 'viewer' NOT NULL;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "reference" text;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "access_token_hash" text;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "selection" jsonb;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "estimate" jsonb;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "estimate_gbp" integer;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "currency" "currency_code";--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "exchange_rate" numeric(12, 6);--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "rate_recorded_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "final_price_gbp" integer;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "project_details" jsonb;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plans" ADD CONSTRAINT "payment_plans_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_schedule_items" ADD CONSTRAINT "payment_schedule_items_plan_id_payment_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."payment_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_schedule_item_id_payment_schedule_items_id_fk" FOREIGN KEY ("schedule_item_id") REFERENCES "public"."payment_schedule_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_recorded_by_admins_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_changes" ADD CONSTRAINT "price_changes_enquiry_id_enquiries_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_changes" ADD CONSTRAINT "price_changes_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_enquiry_id_enquiries_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_created_by_admins_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_reference_unique" UNIQUE("reference");--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_access_token_hash_unique" UNIQUE("access_token_hash");