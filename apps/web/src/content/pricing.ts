export type PricingTier = {
  id: string
  name: string
  range: string
  min: number
  max: number | null
  summary: string
  suitableFor: string[]
  featured?: boolean
}

export const pricingTiers: PricingTier[] = [
  {
    id: "starter-website",
    name: "Websites",
    range: "£2,000 – £5,000",
    min: 2000,
    max: 5000,
    summary: "A professional web presence that explains what you do and turns visitors into enquiries.",
    suitableFor: ["Professional business websites", "Company websites", "Marketing websites", "Landing page systems"],
  },
  {
    id: "web-application",
    name: "Web Applications",
    range: "£4,000 – £12,000",
    min: 4000,
    max: 12000,
    summary: "Custom tools your customers or team use every day, accessible from any browser.",
    suitableFor: ["Customer portals", "Dashboards", "Booking systems", "Custom web applications", "Internal business tools"],
  },
  {
    id: "mobile-application",
    name: "Mobile",
    range: "£5,000 – £15,000",
    min: 5000,
    max: 15000,
    summary: "Mobile apps for your customers or your staff, published to the app stores.",
    suitableFor: ["Android applications", "iOS applications", "Cross-platform applications", "Customer applications", "Business applications"],
  },
  {
    id: "ai-solution",
    name: "AI",
    range: "£3,000 – £20,000",
    min: 3000,
    max: 20000,
    summary: "Practical AI that answers questions, processes documents and automates decisions.",
    suitableFor: ["AI assistants", "AI chatbots", "AI automation", "AI-powered applications", "Document processing", "Intelligent search"],
    featured: true,
  },
  {
    id: "crm-business-systems",
    name: "CRM & Business Systems",
    range: "£7,000 – £25,000",
    min: 7000,
    max: 25000,
    summary: "One system for customers, sales and operations, built around how your team works.",
    suitableFor: ["Custom CRM", "Customer management", "Sales systems", "Employee systems", "Business dashboards", "Workflow systems"],
  },
  {
    id: "saas-platform",
    name: "SaaS",
    range: "£10,000 – £35,000",
    min: 10000,
    max: 35000,
    summary: "Multi-user products with accounts, subscriptions and the foundations to scale.",
    suitableFor: ["SaaS products", "Multi-user platforms", "Subscription platforms", "Marketplaces", "Business platforms"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    range: "£20,000 – £50,000+",
    min: 20000,
    max: null,
    summary: "Large-scale platforms, complex integrations and organisation-wide change.",
    suitableFor: ["Complex business platforms", "Enterprise applications", "Large integrations", "Advanced automation", "Large-scale custom software"],
  },
  {
    id: "digital-transformation",
    name: "Digital Transformation",
    range: "£25,000 – £50,000+",
    min: 25000,
    max: null,
    summary: "Modernising how the business runs: legacy systems, processes and technology together.",
    suitableFor: ["Legacy modernisation", "Multi-system programmes", "Process redesign", "Organisation-wide platforms"],
  },
]

export const complexityScale = [
  { range: "£2k – £5k", label: "Websites and smaller digital projects", level: 1 },
  { range: "£5k – £10k", label: "Web apps, mobile apps and automation", level: 2 },
  { range: "£10k – £25k", label: "CRM, AI and advanced business systems", level: 3 },
  { range: "£25k – £50k", label: "Large SaaS and complex platforms", level: 4 },
  { range: "£50k+", label: "Enterprise and large-scale transformation", level: 5 },
] as const

export const priceMarkers = ["£2,000", "£5,000", "£10,000", "£15,000", "£25,000", "£35,000", "£50,000+"] as const

export type PricingFactor = { title: string; description: string; impact: "Low" | "Medium" | "High" }

export const pricingFactors: PricingFactor[] = [
  { title: "Scope and features", description: "How many screens, user types and workflows the product needs on day one.", impact: "High" },
  { title: "Complexity of logic", description: "Business rules, approvals, calculations, permissions and reporting.", impact: "High" },
  { title: "AI and automation", description: "Whether the product needs AI features, document processing or automated decisions, and how much grounding in your data they require.", impact: "Medium" },
  { title: "Integrations", description: "Connecting to payment providers, accounting tools, CRMs or existing internal systems.", impact: "Medium" },
  { title: "Timeline", description: "Compressing a normal build schedule into fewer weeks means more people working in parallel, which raises cost.", impact: "Medium" },
  { title: "Design depth", description: "Using an existing brand system versus designing a new product experience from scratch.", impact: "Medium" },
  { title: "Data and migration", description: "Importing, cleaning and moving data from spreadsheets or older systems.", impact: "Low" },
  { title: "Security and compliance", description: "Access control, audit trails and industry-specific requirements.", impact: "Low" },
]

export const pricingDisclaimer =
  "These ranges are indicative. Final pricing depends on requirements, complexity, integrations and scope."
