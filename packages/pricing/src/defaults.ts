import type { Complexity, ItemKind, Multiplier, PricingCatalog, PricingCategory, PricingItem, TimelineOption } from "./types.js";

/**
 * Default catalogue, generated from `apps/web/src/content/project-builder.ts`
 * (same ids, labels, blurbs and icon names). Feature prices are the midpoint
 * of their old size band; solution prices are the midpoint of their old
 * indicative range. Seeded into `pricing_items`/`pricing_categories`/
 * `pricing_multipliers`/`pricing_settings` on first boot when empty.
 */

// Midpoint of the old featureSizes bands (apps/web/src/content/project-builder.ts).
const SIZE_PRICE: Record<Complexity, number> = { s: 650, m: 1450, l: 3250, xl: 6750 };

let sortCounter = 0;
function nextSort(): number {
  return sortCounter++;
}

function item(
  id: string,
  kind: ItemKind,
  categoryId: string,
  label: string,
  blurb: string,
  icon: string,
  complexity: Complexity,
  price: number,
  recommends: string[] = [],
): PricingItem {
  return {
    id,
    kind,
    categoryId,
    label,
    blurb,
    icon,
    price,
    complexity,
    recommends,
    requires: [],
    addons: [],
    active: true,
    sort: nextSort(),
  };
}

function feature(
  id: string,
  categoryId: string,
  label: string,
  blurb: string,
  icon: string,
  size: Complexity,
  recommends: string[] = [],
): PricingItem {
  return item(id, "feature", categoryId, label, blurb, icon, size, SIZE_PRICE[size], recommends);
}

function integration(id: string, label: string, blurb: string, icon: string, size: Complexity, recommends: string[] = []): PricingItem {
  return item(id, "integration", "integration", label, blurb, icon, size, SIZE_PRICE[size], recommends);
}

function ai(id: string, label: string, blurb: string, icon: string, size: Complexity, recommends: string[] = []): PricingItem {
  return item(id, "ai", "ai", label, blurb, icon, size, SIZE_PRICE[size], recommends);
}

// Solution base prices — midpoint of the old basePrice range.
sortCounter = 0;
const solutionItems: PricingItem[] = [
  item("custom-software", "solution", "solution", "Custom Software", "Bespoke software shaped around how you work.", "Code2", "m", 12000),
  item("website", "solution", "solution", "Website", "A fast, credible site that turns visitors into enquiries.", "Globe", "s", 3500),
  item("web-app", "solution", "solution", "Web Application", "Browser-based tools for customers or your team.", "AppWindow", "m", 8000),
  item("mobile-app", "solution", "solution", "Mobile Application", "iOS and Android apps, published to the stores.", "Smartphone", "m", 10000),
  item("saas", "solution", "solution", "SaaS Platform", "A subscription product with accounts, billing and tenants.", "Layers", "l", 22500),
  item("crm", "solution", "solution", "CRM / Business System", "One place for customers, pipeline and operations.", "Users", "l", 16000),
  item("ecommerce", "solution", "solution", "E-commerce Platform", "Sell online with catalogue, checkout and fulfilment.", "ShoppingBag", "m", 9000),
  item("ai", "solution", "solution", "AI Solution", "Assistants, agents and models working on your data.", "Brain", "m", 11500),
  item("automation", "solution", "solution", "Automation System", "Remove repetitive manual work between your tools.", "Workflow", "m", 6500),
  item("data-analytics", "solution", "solution", "Data & Analytics Platform", "Pipelines, warehouses and dashboards you can trust.", "ChartLine", "m", 13000),
  item("internal-tool", "solution", "solution", "Internal Business Tool", "Purpose-built tools that replace spreadsheets.", "Briefcase", "m", 8000),
  item("digital-transformation", "solution", "solution", "Digital Transformation", "Modernise processes and systems across the business.", "RefreshCw", "xl", 42500),
  item("not-sure", "solution", "solution", "Not Sure / Need Consultation", "Tell us the problem — we'll help shape the solution.", "HelpCircle", "s", 0),
];

const customerExperienceFeatures: PricingItem[] = [
  feature("customer-accounts", "customer-experience", "Customer Accounts", "Sign-up, sign-in and password recovery for your customers.", "UserCheck", "m"),
  feature("customer-profiles", "customer-experience", "Customer Profiles", "Preferences, history and details in one profile.", "UserRound", "s", ["customer-accounts"]),
  feature("customer-dashboard", "customer-experience", "Customer Dashboard", "A personal home screen with what matters to each customer.", "LayoutDashboard", "m", ["customer-accounts"]),
  feature("customer-portal", "customer-experience", "Customer Portal", "Self-service for documents, requests and account changes.", "AppWindow", "l", ["customer-accounts", "document-management", "in-app-notifications"]),
  feature("booking-system", "customer-experience", "Booking System", "Real-time availability and online booking.", "CalendarCheck", "l", ["email-notifications", "payment-processing", "customer-accounts"]),
  feature("appointment-management", "customer-experience", "Appointment Management", "Reschedules, reminders and staff calendars.", "CalendarClock", "m", ["sms", "email-notifications"]),
  feature("customer-requests", "customer-experience", "Customer Requests", "Structured requests with status updates.", "Inbox", "m", ["workflow-management"]),
  feature("order-tracking", "customer-experience", "Order Tracking", "Live order status from purchase to delivery.", "MapPin", "m", ["order-management", "push-notifications"]),
  feature("notifications", "customer-experience", "Notifications", "Timely updates across the channels customers use.", "Bell", "s", ["email-notifications"]),
  feature("reviews-ratings", "customer-experience", "Reviews & Ratings", "Collect, moderate and display customer feedback.", "Star", "s"),
  feature("loyalty-system", "customer-experience", "Loyalty System", "Points, tiers and rewards that bring customers back.", "Gift", "l", ["customer-accounts"]),
  feature("live-chat", "customer-experience", "Live Chat", "Real-time chat between customers and your team.", "MessageCircle", "m", ["customer-support"]),
];

const businessOperationsFeatures: PricingItem[] = [
  feature("admin-dashboard", "business-operations", "Admin Dashboard", "Manage content, users and data without a developer.", "LayoutDashboard", "m", ["role-permissions"]),
  feature("staff-management", "business-operations", "Staff Management", "Rotas, availability and staff records.", "Users", "m", ["role-permissions"]),
  feature("employee-management", "business-operations", "Employee Management", "Onboarding, records and HR workflows.", "UserCog", "l", ["role-permissions", "document-management"]),
  feature("role-permissions", "business-operations", "Role & Permission Management", "Control who can see and change what.", "KeyRound", "m"),
  feature("workflow-management", "business-operations", "Workflow Management", "Model your processes as clear, trackable stages.", "Workflow", "l", ["approval-system", "audit-logs"]),
  feature("approval-system", "business-operations", "Approval System", "Multi-step sign-off with a clear trail.", "ClipboardCheck", "m", ["audit-logs", "email-notifications"]),
  feature("task-management", "business-operations", "Task Management", "Assign, prioritise and track work.", "ListChecks", "m"),
  feature("document-management", "business-operations", "Document Management", "Store, version and share documents securely.", "FileText", "m", ["role-permissions"]),
  feature("internal-dashboard", "business-operations", "Internal Dashboard", "Operational overview for your team.", "Gauge", "m"),
  feature("reporting", "business-operations", "Reporting", "Scheduled and on-demand operational reports.", "FileDown", "m", ["exportable-reports"]),
];

const commerceFeatures: PricingItem[] = [
  feature("product-catalogue", "commerce", "Product Catalogue", "Products, variants, media and search.", "Package", "m"),
  feature("shopping-cart", "commerce", "Shopping Cart", "Persistent baskets across devices.", "ShoppingCart", "s", ["product-catalogue", "checkout"]),
  feature("checkout", "commerce", "Checkout", "A short, conversion-focused checkout flow.", "Receipt", "m", ["payment-processing", "email-notifications"]),
  feature("payment-processing", "commerce", "Payment Processing", "Card and wallet payments, refunds and receipts.", "CreditCard", "l", ["checkout", "customer-accounts", "order-management"]),
  feature("subscriptions", "commerce", "Subscriptions", "Recurring plans, trials and renewals.", "Repeat", "l", ["payment-processing", "customer-accounts"]),
  feature("discounts", "commerce", "Discounts", "Rule-based pricing and promotions.", "Percent", "s"),
  feature("coupons", "commerce", "Coupons", "Codes with limits, expiry and tracking.", "Ticket", "s"),
  feature("order-management", "commerce", "Order Management", "Process, fulfil and refund orders.", "PackageSearch", "m", ["inventory", "email-notifications"]),
  feature("inventory", "commerce", "Inventory", "Stock levels, locations and alerts.", "Boxes", "m"),
  feature("delivery-management", "commerce", "Delivery Management", "Slots, couriers and proof of delivery.", "Truck", "l", ["order-tracking", "sms"]),
  feature("marketplace", "commerce", "Marketplace", "Multiple sellers under one storefront.", "Store", "xl", ["vendor-management", "payment-processing", "order-management", "customer-accounts", "reviews-ratings"]),
  feature("vendor-management", "commerce", "Vendor Management", "Vendor onboarding, payouts and performance.", "Briefcase", "l", ["role-permissions"]),
];

const communicationFeatures: PricingItem[] = [
  feature("email-notifications", "communication", "Email Notifications", "Branded transactional emails.", "Mail", "s"),
  feature("sms", "communication", "SMS", "Text alerts, reminders and one-time codes.", "MessageSquare", "s", ["sms-integration"]),
  feature("whatsapp", "communication", "WhatsApp", "Conversations on the channel customers prefer.", "MessageCircle", "m", ["whatsapp-integration"]),
  feature("telegram", "communication", "Telegram", "Bots and channel updates on Telegram.", "Send", "s"),
  feature("push-notifications", "communication", "Push Notifications", "Mobile and browser push alerts.", "BellRing", "s"),
  feature("in-app-notifications", "communication", "In-App Notifications", "A notification centre inside your product.", "Bell", "s"),
  feature("automated-messaging", "communication", "Automated Messaging", "Journeys triggered by customer behaviour.", "Workflow", "m", ["email-notifications"]),
  feature("customer-support", "communication", "Customer Support", "Tickets, SLAs and a shared inbox.", "LifeBuoy", "l", ["live-chat"]),
];

const analyticsFeatures: PricingItem[] = [
  feature("business-dashboard", "analytics", "Business Dashboard", "The numbers that run your business, at a glance.", "LayoutDashboard", "m", ["kpi-dashboard"]),
  feature("sales-analytics", "analytics", "Sales Analytics", "Pipeline, revenue and conversion trends.", "TrendingUp", "m"),
  feature("customer-analytics", "analytics", "Customer Analytics", "Cohorts, retention and lifetime value.", "Users", "m"),
  feature("financial-reporting", "analytics", "Financial Reporting", "P&L, cash and management accounts.", "Coins", "l", ["accounting-integration"]),
  feature("real-time-analytics", "analytics", "Real-Time Analytics", "Live metrics as events happen.", "Activity", "l"),
  feature("custom-reports", "analytics", "Custom Reports", "Build and save your own reports.", "FileText", "m"),
  feature("exportable-reports", "analytics", "Exportable Reports", "CSV, Excel and PDF exports.", "FileDown", "s"),
  feature("data-visualisation", "analytics", "Data Visualisation", "Clear, interactive charts and maps.", "ChartPie", "m"),
  feature("kpi-dashboard", "analytics", "KPI Dashboard", "Targets and progress against goals.", "Gauge", "m"),
];

const securityFeatures: PricingItem[] = [
  feature("two-factor-auth", "security", "Two-Factor Authentication", "A second step at sign-in for sensitive accounts.", "Fingerprint", "s"),
  feature("single-sign-on", "security", "Single Sign-On", "Sign in with Google, Microsoft or your IdP.", "KeyRound", "m"),
  feature("role-based-access", "security", "Role-Based Access", "Access tied to job role across the system.", "UserCheck", "m"),
  feature("advanced-permissions", "security", "Advanced Permissions", "Record-level and field-level access rules.", "Lock", "l", ["role-based-access", "audit-logs"]),
  feature("encryption", "security", "Encryption", "Sensitive data encrypted at rest and in transit.", "Lock", "m"),
  // Shared with business-operations in the web content; kept as one catalog item under security.
  feature("audit-logs", "security", "Audit Logs", "A tamper-evident record of who did what, and when.", "ScrollText", "s"),
  feature("security-monitoring", "security", "Security Monitoring", "Alerts on suspicious activity.", "ShieldAlert", "m", ["audit-logs"]),
  feature("compliance-features", "security", "Compliance Features", "Consent, retention and data-subject requests.", "BadgeCheck", "l", ["audit-logs", "encryption"]),
  feature("kyc-verification", "security", "KYC & Verification", "Identity and document checks during onboarding.", "ScanSearch", "l", ["document-ai", "audit-logs", "two-factor-auth"]),
];

const platformFeatures: PricingItem[] = [
  feature("multi-tenant", "platform", "Multi-Tenant Architecture", "Many customers, fully isolated data.", "Boxes", "xl", ["role-permissions"]),
  feature("subscription-management", "platform", "Subscription Management", "Plans, seats, upgrades and cancellations.", "Repeat", "l", ["saas-billing"]),
  feature("saas-billing", "platform", "SaaS Billing", "Invoices, usage billing and dunning.", "Receipt", "l", ["payment-gateway"]),
  feature("multi-language", "platform", "Multi-Language", "Translated interfaces and content.", "Languages", "m"),
  feature("multi-currency", "platform", "Multi-Currency", "Prices and payments in local currency.", "Coins", "m"),
  feature("multi-region", "platform", "Multi-Region", "Data residency and regional hosting.", "Globe", "l"),
  feature("white-label", "platform", "White Label", "Rebrand the product for each client.", "Palette", "l", ["multi-tenant"]),
  feature("api-platform", "platform", "API Platform", "Keys, rate limits and versioned APIs.", "Server", "l", ["developer-portal", "webhooks"]),
  feature("developer-portal", "platform", "Developer Portal", "Docs, sandbox and onboarding for developers.", "Terminal", "m", ["api-platform"]),
];

const featureItems: PricingItem[] = [
  ...customerExperienceFeatures,
  ...businessOperationsFeatures,
  ...commerceFeatures,
  ...communicationFeatures,
  ...analyticsFeatures,
  ...securityFeatures,
  ...platformFeatures,
];

const integrationItems: PricingItem[] = [
  integration("payment-gateway", "Payment Gateway", "Stripe, PayPal, GoCardless and similar.", "Wallet", "m"),
  integration("crm-integration", "CRM Integration", "Sync with HubSpot, Salesforce and others.", "Users", "m", ["data-sync"]),
  integration("accounting-integration", "Accounting Integration", "Xero, QuickBooks, Sage and similar.", "Receipt", "m", ["data-sync"]),
  integration("erp-integration", "ERP Integration", "Connect to your ERP for orders and stock.", "Blocks", "l", ["data-sync"]),
  integration("email-integration", "Email Integration", "Gmail, Outlook and marketing platforms.", "Mail", "s"),
  integration("sms-integration", "SMS Integration", "Twilio, MessageBird and similar.", "MessageSquare", "s"),
  integration("whatsapp-integration", "WhatsApp Integration", "WhatsApp Business Platform.", "MessageCircle", "m"),
  integration("google-services", "Google Services", "Workspace, Maps, Calendar and more.", "Globe", "s"),
  integration("microsoft-services", "Microsoft Services", "Microsoft 365, Teams and Entra ID.", "AppWindow", "s"),
  integration("third-party-api", "Third-Party API", "Integrate a specific external service.", "Plug", "m"),
  integration("custom-api", "Custom API", "A documented API others can build on.", "Code2", "l", ["webhooks"]),
  integration("webhooks", "Webhooks", "Real-time events to and from other systems.", "Webhook", "s"),
  integration("data-sync", "Data Synchronisation", "Keep records consistent across systems.", "RefreshCw", "l"),
];

const aiItems: PricingItem[] = [
  ai("ai-chatbot", "AI Chatbot", "Answers common questions around the clock.", "Bot", "l", ["rag-knowledge-base"]),
  ai("ai-assistant", "AI Assistant", "An assistant trained around your business knowledge.", "Sparkles", "xl", ["rag-knowledge-base", "customer-accounts", "admin-dashboard", "business-dashboard"]),
  ai("ai-agents", "AI Agents", "Autonomous agents that complete multi-step tasks.", "Network", "xl", ["ai-workflow-automation", "audit-logs"]),
  ai("document-ai", "Document AI", "Extract and validate data from documents.", "FileSearch", "l", ["document-management"]),
  ai("ai-search", "AI Search", "Search that understands meaning, not just keywords.", "Search", "l"),
  ai("rag-knowledge-base", "RAG Knowledge Base", "Grounds AI answers in your own content.", "Database", "l"),
  ai("ai-content-generation", "AI Content Generation", "Drafts copy, descriptions and replies.", "PenLine", "m"),
  ai("ai-data-analysis", "AI Data Analysis", "Ask questions of your data in plain English.", "ChartPie", "l", ["business-dashboard"]),
  ai("ai-recommendations", "AI Recommendations", "Personalised suggestions for each user.", "Sparkles", "l", ["customer-analytics"]),
  ai("predictive-analytics", "Predictive Analytics", "Forecast demand, churn and risk.", "TrendingUp", "xl", ["data-visualisation"]),
  ai("computer-vision", "Computer Vision", "Recognise objects, defects or documents in images.", "Camera", "xl"),
  ai("voice-ai", "Voice AI", "Speech-driven assistants and transcription.", "Mic", "xl"),
  ai("ai-workflow-automation", "AI Workflow Automation", "AI steps inside your business processes.", "Zap", "l", ["workflow-management"]),
];

const platformItems: PricingItem[] = [
  item("web", "platform", "platform", "Web browser", "A responsive web application, works in any browser.", "Globe", "s", 0),
  item("ios", "platform", "platform", "iPhone & iPad", "A native iOS app, published to the App Store.", "Smartphone", "m", 3500),
  item("android", "platform", "platform", "Android", "A native Android app, published to Google Play.", "Smartphone", "m", 3500),
  item("desktop", "platform", "platform", "Desktop app", "A native desktop app for Windows, macOS or Linux.", "AppWindow", "m", 2800),
  item("api", "platform", "platform", "API / headless", "A documented API with no bundled front end.", "Code2", "m", 2200),
  item("admin-panel", "platform", "platform", "Admin panel", "A separate back-office interface for your team.", "LayoutDashboard", "m", 3000),
];

const designItems: PricingItem[] = [
  item("existing-brand", "design", "design", "Use Existing Brand", "Work within your current brand guidelines.", "BadgeCheck", "s", 0),
  item("new-ui-design", "design", "design", "New UI Design", "A fresh interface designed from scratch.", "Palette", "m", 3500),
  item("design-system", "design", "design", "Design System", "Reusable components and tokens for consistent UI.", "Layers", "m", 4500),
  item("ux-research", "design", "design", "UX Research", "User interviews and testing to guide design decisions.", "Search", "m", 2500),
  item("accessibility-audit", "design", "design", "Accessibility Audit", "WCAG review and a remediation plan.", "ShieldCheck", "s", 1500),
  item("motion-illustration", "design", "design", "Motion & Illustration", "Custom animation and illustration work.", "Sparkles", "m", 3000),
];

const supportItems: PricingItem[] = [
  item("support-none", "support", "support", "No Ongoing Support", "No support contract — ad-hoc requests only.", "HelpCircle", "s", 0),
  item("support-basic", "support", "support", "Basic Support", "Email support during business hours.", "LifeBuoy", "s", 150),
  item("support-priority", "support", "support", "Priority Support", "Fast-response support with a dedicated channel.", "ShieldAlert", "m", 400),
];

const maintenanceItems: PricingItem[] = [
  item("maintenance-none", "maintenance", "maintenance", "No Ongoing Maintenance", "No maintenance contract in place.", "HelpCircle", "s", 0),
  item("maintenance-standard", "maintenance", "maintenance", "Standard Maintenance", "Updates, monitoring and bug fixes.", "Wrench", "s", 250),
  item("maintenance-enterprise", "maintenance", "maintenance", "Enterprise Maintenance", "Proactive monitoring, SLAs and priority fixes.", "ShieldCheck", "m", 600),
];

const categories: PricingCategory[] = [
  { id: "customer-experience", label: "Customer Experience", icon: "UserRound", sort: 0 },
  { id: "business-operations", label: "Business Operations", icon: "Briefcase", sort: 1 },
  { id: "commerce", label: "Commerce", icon: "ShoppingBag", sort: 2 },
  { id: "communication", label: "Communication", icon: "MessagesSquare", sort: 3 },
  { id: "analytics", label: "Analytics", icon: "BarChart3", sort: 4 },
  { id: "security", label: "Security", icon: "ShieldCheck", sort: 5 },
  { id: "platform", label: "Platform", icon: "Layers", sort: 6 },
];

const complexity: Multiplier[] = [
  { id: "standard", label: "Standard", description: "Well-understood build using proven patterns.", multiplier: 1.0, sort: 0 },
  { id: "advanced", label: "Advanced", description: "Higher technical complexity or custom integrations.", multiplier: 1.15, sort: 1 },
  { id: "enterprise-grade", label: "Enterprise-Grade", description: "Strict compliance, scale or reliability requirements.", multiplier: 1.3, sort: 2 },
];

const timelines: TimelineOption[] = [
  { id: "flexible", label: "Flexible", description: "No fixed deadline — scheduled around our roadmap.", multiplier: 1.0, weeks: 26, sort: 0 },
  { id: "3-6-months", label: "3-6 Months", description: "Standard delivery window.", multiplier: 1.0, weeks: 24, sort: 1 },
  { id: "2-3-months", label: "2-3 Months", description: "Faster delivery with adjusted planning.", multiplier: 1.1, weeks: 13, sort: 2 },
  { id: "1-2-months", label: "1-2 Months", description: "Accelerated delivery, dedicated capacity.", multiplier: 1.2, weeks: 8, sort: 3 },
  { id: "asap", label: "ASAP", description: "Fastest possible delivery, highest priority.", multiplier: 1.35, weeks: 6, sort: 4 },
];

const scale: Multiplier[] = [
  { id: "under-100", label: "Under 100", description: "Small user base, minimal scale requirements.", multiplier: 1.0, sort: 0 },
  { id: "100-1k", label: "100 – 1,000", description: "Moderate scale.", multiplier: 1.05, sort: 1 },
  { id: "1k-10k", label: "1,000 – 10,000", description: "Meaningful scale requiring performance headroom.", multiplier: 1.1, sort: 2 },
  { id: "10k-100k", label: "10,000 – 100,000", description: "High scale requiring robust infrastructure.", multiplier: 1.18, sort: 3 },
  { id: "100k-plus", label: "100,000+", description: "Enterprise scale — reliability and performance are critical.", multiplier: 1.25, sort: 4 },
  { id: "not-sure", label: "Not sure yet", description: "No scale multiplier applied until scale is known.", multiplier: 1.0, sort: 5 },
];

export const defaultCatalog: PricingCatalog = {
  version: "2026-01-01T00:00:00.000Z",
  items: [...solutionItems, ...featureItems, ...platformItems, ...integrationItems, ...aiItems, ...designItems, ...supportItems, ...maintenanceItems],
  categories,
  complexity,
  timelines,
  scale,
  settings: {
    additionalSolutionFactor: 0.5,
    rangeLow: 0.9,
    rangeHigh: 1.2,
    roundTo: 250,
  },
};
