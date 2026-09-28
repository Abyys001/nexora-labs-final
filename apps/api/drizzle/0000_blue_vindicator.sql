CREATE TYPE "public"."budget" AS ENUM('2k-5k', '5k-10k', '10k-25k', '25k-50k', '50k-plus', 'not-sure');--> statement-breakpoint
CREATE TYPE "public"."company_size" AS ENUM('1-10', '11-50', '51-200', '201-1000', '1000-plus');--> statement-breakpoint
CREATE TYPE "public"."enquiry_source" AS ENUM('contact', 'quote');--> statement-breakpoint
CREATE TYPE "public"."enquiry_status" AS ENUM('new', 'contacted', 'qualified', 'won', 'lost', 'archived');--> statement-breakpoint
CREATE TYPE "public"."preferred_contact" AS ENUM('email', 'phone', 'video-call');--> statement-breakpoint
CREATE TYPE "public"."project_type" AS ENUM('website', 'web-app', 'mobile-app', 'ai', 'crm', 'saas', 'automation', 'ecommerce', 'other');--> statement-breakpoint
CREATE TYPE "public"."timeline" AS ENUM('asap', '1-3-months', '3-6-months', '6-plus-months', 'flexible');--> statement-breakpoint
CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" uuid PRIMARY KEY NOT NULL,
	"source" "enquiry_source" NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"company" text,
	"phone" text,
	"project_type" "project_type" NOT NULL,
	"budget" "budget" NOT NULL,
	"description" text NOT NULL,
	"preferred_contact" "preferred_contact" DEFAULT 'email' NOT NULL,
	"industry" text,
	"company_size" "company_size",
	"website" text,
	"features" text[],
	"timeline" timeline,
	"start_date" text,
	"status" "enquiry_status" DEFAULT 'new' NOT NULL,
	"notes" text,
	"ip_hash" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
