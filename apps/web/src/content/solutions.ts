import type { Item } from "./services"

export type Solution = {
  slug: string
  name: string
  title: string
  intro: string
  seoDescription: string
  challenges: string[]
  approach: Item[]
  typicalProjects: string[]
  budgetGuide: string
  services: string[]
}

export const solutions: Solution[] = [
  {
    slug: "startups",
    name: "Startups",
    title: "Turn Your Idea Into a Product Customers Can Use",
    intro: "We help founders define what to build first, design it properly and launch a product that is ready to learn from, and ready to grow.",
    seoDescription: "Software and app development for startups: product discovery, MVPs and SaaS platforms built to launch quickly and scale.",
    challenges: ["Too many ideas and not enough clarity on what to build first", "Limited runway, so every week and pound matters", "No technical co-founder or in-house team", "Needing a product credible enough for customers and investors"],
    approach: [
      { title: "Define the first version", description: "We focus the scope on the smallest product that proves your idea." },
      { title: "Design before building", description: "Clickable prototypes let you test with users before committing budget." },
      { title: "Build on solid foundations", description: "Accounts, payments and admin done properly so you don't rebuild later." },
      { title: "Iterate after launch", description: "Improve the product based on real usage and feedback." },
    ],
    typicalProjects: ["Minimum viable product (MVP)", "SaaS platform", "Marketplace", "Mobile app", "Investor-ready prototype"],
    budgetGuide: "Most first versions sit between £5,000 and £25,000, depending on scope.",
    services: ["ui-ux-design", "software-development", "mobile-app-development"],
  },
  {
    slug: "small-medium-businesses",
    name: "Small & Medium Businesses",
    title: "Practical Technology That Saves Time Every Day",
    intro: "You don't need an in-house tech team to benefit from great software. We help small and medium businesses remove admin, look more professional and serve customers better.",
    seoDescription: "Software, websites and automation for small and medium businesses. Practical technology with clear pricing and ongoing support.",
    challenges: ["Admin eating into time for customers and growth", "An outdated website that doesn't reflect the business", "Tools that don't talk to each other", "No one in-house to manage technology"],
    approach: [
      { title: "Start with the biggest time drain", description: "We identify the one change that will make the clearest difference." },
      { title: "Use what already works", description: "We connect and extend your existing tools where it makes sense." },
      { title: "Clear, fixed scopes", description: "You'll know what you're getting and what it will cost." },
      { title: "Support when you need it", description: "An ongoing partner without the cost of hiring." },
    ],
    typicalProjects: ["Business website", "Booking or quoting system", "Custom CRM", "Workflow automation", "Customer portal"],
    budgetGuide: "Most projects sit between £2,000 and £15,000.",
    services: ["web-development", "automation-integrations", "crm-business-systems"],
  },
  {
    slug: "growing-businesses",
    name: "Growing Businesses",
    title: "Software That Keeps Up With Your Growth",
    intro: "Growth exposes the limits of the tools you started with. We help scaling businesses replace workarounds with systems designed for the next stage.",
    seoDescription: "Custom software and business systems for growing companies: replace workarounds, connect teams and scale operations.",
    challenges: ["Processes that worked at 10 people breaking at 50", "Spreadsheets becoming business-critical", "Teams working from different versions of the truth", "Customer expectations rising faster than capacity"],
    approach: [
      { title: "Map how work really flows", description: "We understand the process before designing the system." },
      { title: "Replace in stages", description: "Modernise one area at a time without disrupting the business." },
      { title: "Connect the business", description: "Sales, operations and finance working from shared data." },
      { title: "Design for scale", description: "Systems that handle more customers, staff and data over time." },
    ],
    typicalProjects: ["Operations platform", "Custom CRM", "Customer portal", "AI automation", "Management dashboards"],
    budgetGuide: "Typically £7,000 – £35,000, often delivered in phases.",
    services: ["crm-business-systems", "software-development", "ai-solutions"],
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    title: "Complex Platforms, Delivered With Clarity",
    intro: "We work with larger organisations on complex platforms, integrations and modernisation, combining engineering depth with clear, business-focused communication.",
    seoDescription: "Enterprise software development: complex platforms, legacy modernisation, integrations and governed AI solutions.",
    challenges: ["Legacy systems that are costly and risky to change", "Many stakeholders with different priorities", "Security, governance and compliance requirements", "Pressure to adopt AI responsibly"],
    approach: [
      { title: "Structured discovery", description: "Align stakeholders on goals, constraints and success measures." },
      { title: "Phased delivery", description: "Deliver value early while managing risk across the programme." },
      { title: "Security by design", description: "Access control, auditability and data protection from the start." },
      { title: "Transparent progress", description: "Regular demos, clear reporting and shared roadmaps." },
    ],
    typicalProjects: ["Enterprise applications", "Legacy modernisation", "System integration", "Internal platforms", "Governed AI solutions"],
    budgetGuide: "Enterprise engagements typically start from £20,000 and scale with scope.",
    services: ["software-development", "cloud-devops", "automation-integrations"],
  },
  {
    slug: "digital-transformation",
    name: "Digital Transformation",
    title: "Modernise How Your Business Runs",
    intro: "Digital transformation is not about technology for its own sake. It's about removing friction from how your business serves customers and gets work done.",
    seoDescription: "Digital transformation services: modernise processes, systems and customer experiences with practical, phased technology change.",
    challenges: ["Paper and manual processes slowing everything down", "Ageing systems nobody wants to touch", "Customer experience lagging behind competitors", "Uncertainty about where to start"],
    approach: [
      { title: "Assess and prioritise", description: "Identify the changes with the greatest business impact." },
      { title: "Build a roadmap", description: "A phased plan that balances ambition with risk and budget." },
      { title: "Deliver and adopt", description: "Launch in stages and support teams through the change." },
      { title: "Measure and improve", description: "Track outcomes and refine as the business learns." },
    ],
    typicalProjects: ["Process digitisation", "System modernisation", "Customer self-service", "Automation and AI", "Data and reporting"],
    budgetGuide: "Usually delivered in phases, from £10,000 per phase to £50,000+ programmes.",
    services: ["software-development", "automation-integrations", "ai-solutions"],
  },
]

export function getSolution(slug: string) {
  return solutions.find((s) => s.slug === slug)
}
