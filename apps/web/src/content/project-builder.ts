import type { LucideIcon } from "lucide-react"
import {
  Activity,
  AppWindow,
  BadgeCheck,
  BarChart3,
  Bell,
  BellRing,
  Blocks,
  Bot,
  Boxes,
  Brain,
  Briefcase,
  CalendarCheck,
  CalendarClock,
  Camera,
  ChartLine,
  ChartPie,
  ClipboardCheck,
  Code2,
  Coins,
  CreditCard,
  Database,
  FileSearch,
  FileText,
  FileDown,
  Fingerprint,
  Gauge,
  Gift,
  Globe,
  HelpCircle,
  Inbox,
  Kanban,
  KeyRound,
  Languages,
  LayoutDashboard,
  Layers,
  LifeBuoy,
  ListChecks,
  Lock,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  Mic,
  Network,
  Package,
  PackageSearch,
  Palette,
  PenLine,
  Percent,
  Plug,
  Receipt,
  RefreshCw,
  Repeat,
  ScanSearch,
  ScrollText,
  Search,
  Send,
  Server,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Terminal,
  Ticket,
  TrendingUp,
  Truck,
  UserCheck,
  UserCog,
  UserRound,
  Users,
  Wallet,
  Webhook,
  Workflow,
  Wrench,
  Zap,
} from "lucide-react"

import { defaultCatalog } from "@cybercina/pricing"

import type { BrandIconName } from "@/components/icons/brand-icons"
import type { projectStages, userScales } from "@/lib/enquiry"

/*
 * Project Builder presentation data. Every price lives in the pricing
 * catalogue (`@cybercina/pricing`, served live by the API) — this file only
 * maps catalogue items to icons and carries copy that isn't priced:
 * industries, goals, smart-recommendation rules.
 */

// ---- Icon resolution — catalogue items carry a generic icon key string
// (e.g. "Code2"); this resolves it to the actual component. ----
export const iconByKey: Record<string, LucideIcon> = {
  Activity,
  AppWindow,
  BadgeCheck,
  BarChart3,
  Bell,
  BellRing,
  Blocks,
  Bot,
  Boxes,
  Brain,
  Briefcase,
  CalendarCheck,
  CalendarClock,
  Camera,
  ChartLine,
  ChartPie,
  ClipboardCheck,
  Code2,
  Coins,
  CreditCard,
  Database,
  FileSearch,
  FileText,
  FileDown,
  Fingerprint,
  Gauge,
  Gift,
  Globe,
  HelpCircle,
  Inbox,
  Kanban,
  KeyRound,
  Languages,
  LayoutDashboard,
  Layers,
  LifeBuoy,
  ListChecks,
  Lock,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  Mic,
  Network,
  Package,
  PackageSearch,
  Palette,
  PenLine,
  Percent,
  Plug,
  Receipt,
  RefreshCw,
  Repeat,
  ScanSearch,
  ScrollText,
  Search,
  Send,
  Server,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Terminal,
  Ticket,
  TrendingUp,
  Truck,
  UserCheck,
  UserCog,
  UserRound,
  Users,
  Wallet,
  Webhook,
  Workflow,
  Wrench,
  Zap,
}

export function resolveIcon(key: string | undefined): LucideIcon {
  return (key && iconByKey[key]) || HelpCircle
}

// ---- Brand icon overrides for solution types (catalogue items only carry a
// generic Lucide icon key; brand marks are a cosmetic web-only touch). ----
export const solutionBrandIcons: Record<string, BrandIconName> = {
  "custom-software": "software-development",
  website: "web-development",
  "web-app": "ui-ux",
  "mobile-app": "mobile-development",
  saas: "saas",
  crm: "crm",
  ecommerce: "ecommerce",
  ai: "ai-machine-learning",
  automation: "automation",
  "data-analytics": "data-engineering",
  "internal-tool": "api-integrations",
  "digital-transformation": "digital-transformation",
}

// ---- Industries & goals aren't priced items, so they live entirely here. ----
export type BuilderIndustry = { id: string; label: string; blurb: string; brandIcon: BrandIconName }

export const builderIndustries: BuilderIndustry[] = [
  { id: "finance-fintech", label: "Finance & FinTech", blurb: "Advisers, wealth, fintech products", brandIcon: "fintech" },
  { id: "banking-payments", label: "Banking & Payments", blurb: "Accounts, cards, payment flows", brandIcon: "banking-payments" },
  { id: "currency-exchange", label: "Currency Exchange", blurb: "FX desks, remittance, bureaux", brandIcon: "currency-exchange" },
  { id: "healthcare", label: "Healthcare", blurb: "Clinics, practices, care providers", brandIcon: "healthcare" },
  { id: "real-estate", label: "Real Estate", blurb: "Agents, lettings, property managers", brandIcon: "real-estate" },
  { id: "mortgage-lending", label: "Mortgage & Lending", blurb: "Brokers, lenders, underwriting", brandIcon: "mortgage-lending" },
  { id: "ecommerce-retail", label: "E-commerce & Retail", blurb: "Online stores, retail chains", brandIcon: "ecommerce-retail" },
  { id: "food-beverage", label: "Food & Beverage", blurb: "Restaurants, producers, delivery", brandIcon: "food-beverage" },
  { id: "travel-hospitality", label: "Travel & Hospitality", blurb: "Hotels, tours, venues", brandIcon: "travel-hospitality" },
  { id: "logistics", label: "Logistics & Transportation", blurb: "Fleets, freight, last-mile", brandIcon: "logistics" },
  { id: "education", label: "Education & E-Learning", blurb: "Schools, courses, training", brandIcon: "education" },
  { id: "media-entertainment", label: "Media & Entertainment", blurb: "Streaming, studios, events", brandIcon: "media-entertainment" },
  { id: "automotive", label: "Automotive", blurb: "Dealers, garages, mobility", brandIcon: "automotive" },
  { id: "aviation", label: "Aviation", blurb: "Operators, MRO, charter", brandIcon: "aviation" },
  { id: "energy-utilities", label: "Energy & Utilities", blurb: "Suppliers, renewables, metering", brandIcon: "energy-utilities" },
  { id: "oil-gas", label: "Oil & Gas", blurb: "Field ops, assets, compliance", brandIcon: "oil-gas" },
  { id: "construction", label: "Construction", blurb: "Contractors, sites, estimating", brandIcon: "construction" },
  { id: "sports", label: "Sports", blurb: "Clubs, academies, fitness", brandIcon: "sports" },
  { id: "professional-services", label: "Professional Services", blurb: "Legal, accounting, consulting", brandIcon: "professional-services" },
  { id: "publishing", label: "Publishing", blurb: "Publishers, newsrooms, content", brandIcon: "publishing" },
  { id: "startups", label: "Startups", blurb: "Validating and launching fast", brandIcon: "startups" },
  { id: "sme", label: "SME", blurb: "Growing small and mid-sized firms", brandIcon: "sme" },
  { id: "enterprise", label: "Enterprise", blurb: "Large, multi-team organisations", brandIcon: "enterprise" },
  { id: "other", label: "Other", blurb: "Something not listed here", brandIcon: "other" },
]

export type Goal = { id: string; label: string; icon: LucideIcon }

export const goals: Goal[] = [
  { id: "more-leads", label: "Generate more leads", icon: Megaphone },
  { id: "sell-online", label: "Sell products online", icon: ShoppingCart },
  { id: "automate-manual", label: "Automate manual work", icon: Zap },
  { id: "reduce-costs", label: "Reduce operational costs", icon: TrendingUp },
  { id: "customer-experience", label: "Improve customer experience", icon: Star },
  { id: "new-product", label: "Build a new digital product", icon: Sparkles },
  { id: "replace-system", label: "Replace an existing system", icon: Repeat },
  { id: "connect-systems", label: "Connect multiple systems", icon: Plug },
  { id: "introduce-ai", label: "Introduce AI into the business", icon: Bot },
  { id: "internal-operations", label: "Improve internal operations", icon: Kanban },
  { id: "customer-portal", label: "Create a customer portal", icon: UserRound },
  { id: "employee-portal", label: "Create an employee portal", icon: UserCog },
  { id: "launch-saas", label: "Launch a SaaS product", icon: Layers },
  { id: "expand-internationally", label: "Expand internationally", icon: Languages },
  { id: "reporting", label: "Improve reporting & analytics", icon: BarChart3 },
  { id: "modernise-legacy", label: "Modernise legacy software", icon: Server },
  { id: "other", label: "Other", icon: HelpCircle },
]

export type Recommendation = {
  id: string
  /** Every non-empty group must match at least one selection. */
  when: { solutionTypes?: string[]; industries?: string[]; goals?: string[]; features?: string[] }
  /** Catalogue item ids (feature, integration, ai or design) to suggest. */
  suggest: string[]
  reason: string
}

const financial = ["finance-fintech", "banking-payments", "currency-exchange", "mortgage-lending"]

export const recommendations: Recommendation[] = [
  { id: "fintech-kyc", when: { industries: financial, features: ["customer-portal", "payment-processing", "customer-accounts", "payment-gateway"] }, suggest: ["kyc-verification", "two-factor-auth", "audit-logs", "compliance-features"], reason: "Regulated financial products usually need identity checks, strong sign-in and a full audit trail." },
  { id: "fx-rates", when: { industries: ["currency-exchange"] }, suggest: ["multi-currency", "real-time-analytics", "third-party-api"], reason: "Exchange businesses depend on live rates and multi-currency handling." },
  { id: "health-records", when: { industries: ["healthcare"] }, suggest: ["appointment-management", "encryption", "role-based-access", "compliance-features"], reason: "Patient data needs strict access control, encryption and clear consent." },
  { id: "property", when: { industries: ["real-estate", "mortgage-lending"] }, suggest: ["booking-system", "document-management", "crm-integration"], reason: "Property teams live on viewings, documents and their CRM." },
  { id: "retail", when: { industries: ["ecommerce-retail", "food-beverage"] }, suggest: ["product-catalogue", "checkout", "inventory", "order-tracking"], reason: "Selling physical goods needs a catalogue, stock and clear order status." },
  { id: "ecommerce-core", when: { solutionTypes: ["ecommerce"] }, suggest: ["product-catalogue", "shopping-cart", "checkout", "payment-processing", "order-management"], reason: "These form the core of any online store." },
  { id: "logistics", when: { industries: ["logistics", "automotive", "aviation"] }, suggest: ["order-tracking", "delivery-management", "real-time-analytics"], reason: "Operations that move things need live tracking and visibility." },
  { id: "saas-core", when: { solutionTypes: ["saas"] }, suggest: ["multi-tenant", "subscription-management", "saas-billing", "customer-accounts"], reason: "A SaaS product needs tenants, plans and billing from day one." },
  { id: "ai-core", when: { solutionTypes: ["ai"] }, suggest: ["ai-assistant", "rag-knowledge-base", "ai-search"], reason: "Most business AI starts by grounding an assistant in your own knowledge." },
  { id: "ai-goal", when: { goals: ["introduce-ai"] }, suggest: ["ai-assistant", "document-ai", "ai-workflow-automation"], reason: "Common first steps for bringing AI into day-to-day work." },
  { id: "automate", when: { goals: ["automate-manual", "reduce-costs"] }, suggest: ["workflow-management", "ai-workflow-automation", "webhooks", "data-sync"], reason: "Automating manual work usually means modelling the workflow and connecting systems." },
  { id: "connect", when: { goals: ["connect-systems", "replace-system", "modernise-legacy"] }, suggest: ["data-sync", "custom-api", "webhooks"], reason: "Replacing or connecting systems depends on reliable data flow between them." },
  { id: "international", when: { goals: ["expand-internationally"] }, suggest: ["multi-language", "multi-currency", "multi-region"], reason: "Operating across borders means language, currency and data residency." },
  { id: "reporting", when: { goals: ["reporting"] }, suggest: ["business-dashboard", "kpi-dashboard", "custom-reports", "exportable-reports"], reason: "Better decisions start with dashboards the whole team trusts." },
  { id: "portals", when: { goals: ["customer-portal"] }, suggest: ["customer-portal", "customer-accounts", "in-app-notifications"], reason: "The building blocks of a customer self-service portal." },
  { id: "employee-portal", when: { goals: ["employee-portal", "internal-operations"] }, suggest: ["employee-management", "single-sign-on", "task-management"], reason: "Staff portals work best with single sign-on and shared task tracking." },
  { id: "mobile", when: { solutionTypes: ["mobile-app"] }, suggest: ["push-notifications", "customer-accounts"], reason: "Mobile apps rely on accounts and push to keep users engaged." },
  { id: "enterprise", when: { industries: ["enterprise"] }, suggest: ["single-sign-on", "advanced-permissions", "audit-logs", "security-monitoring"], reason: "Enterprise buyers expect SSO, fine-grained access and monitoring." },
  { id: "leads", when: { goals: ["more-leads"] }, suggest: ["automated-messaging", "crm-integration", "sales-analytics"], reason: "Capturing leads pays off when follow-up and tracking are automatic." },
]

// ---- Legacy label lookups, kept for the admin enquiry viewer (pre-v2
// enquiries stored a `configuration` blob with these ids and kinds). Labels
// resolve against the live catalogue's defaults — no prices are exposed. ----
const catalogLabelMap = new Map(defaultCatalog.items.map((i) => [i.id, i.label]))

export const userScaleLabels: Record<(typeof userScales)[number], string> = {
  "under-100": "Under 100",
  "100-1k": "100 – 1,000",
  "1k-10k": "1,000 – 10,000",
  "10k-100k": "10,000 – 100,000",
  "100k-plus": "100,000+",
  "not-sure": "Not sure yet",
}

export const projectStageLabels: Record<(typeof projectStages)[number], string> = {
  idea: "Just an idea",
  prototype: "Prototype or designs",
  "live-product": "Live product to extend",
  "replacing-system": "Replacing an existing system",
}

export type BuilderListKey = "solutionTypes" | "industries" | "goals" | "features" | "platforms" | "integrations" | "ai" | "design"

export function builderLabel(kind: BuilderListKey, id: string): string {
  if (kind === "industries") return builderIndustries.find((x) => x.id === id)?.label ?? id
  if (kind === "goals") return goals.find((x) => x.id === id)?.label ?? id
  return catalogLabelMap.get(id) ?? id
}
