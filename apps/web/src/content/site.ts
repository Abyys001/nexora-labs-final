export const site = {
  name: "Cybercina",
  tagline: "Technology Built Around Your Business.",
  description:
    "Custom software, AI and digital solutions for businesses ready to grow. Cybercina designs and builds web platforms, mobile apps, AI solutions and business systems.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "info@cybercina.co.uk",
  phone: { display: "020 7046 6615", href: "tel:+442070466615" },
  whatsapp: "https://wa.me/442070466615",
  hours: "Monday – Friday, 9:00 – 17:30 (UK time)",
  location: "UK-based · Working remotely with clients internationally",
  responseTime: "We aim to reply to every enquiry within one business day.",
} as const

export type TechItem = { name: string; slug?: string }
export type TechGroup = { name: string; blurb: string; items: TechItem[] }

export const technologies: TechGroup[] = [
  {
    name: "AI & Data",
    blurb: "Practical AI built on established models and grounded in your own data.",
    items: [
      { name: "OpenAI" },
      { name: "Anthropic Claude", slug: "anthropic" },
      { name: "Python", slug: "python" },
      { name: "FastAPI", slug: "fastapi" },
      { name: "LangChain", slug: "langchain" },
      { name: "PostgreSQL", slug: "postgresql" },
    ],
  },
  {
    name: "Product",
    blurb: "Modern, well-supported frameworks for web and mobile products.",
    items: [
      { name: "Next.js", slug: "nextdotjs" },
      { name: "React", slug: "react" },
      { name: "TypeScript", slug: "typescript" },
      { name: "Flutter", slug: "flutter" },
      { name: "NestJS", slug: "nestjs" },
      { name: "Tailwind CSS", slug: "tailwindcss" },
    ],
  },
  {
    name: "Cloud",
    blurb: "Reliable infrastructure that scales with usage, not against it.",
    items: [
      { name: "Docker", slug: "docker" },
      { name: "AWS" },
      { name: "Cloudflare", slug: "cloudflare" },
      { name: "Vercel", slug: "vercel" },
      { name: "GitHub Actions", slug: "githubactions" },
      { name: "Redis", slug: "redis" },
    ],
  },
  {
    name: "Business",
    blurb: "Connecting the tools that already run your business.",
    items: [
      { name: "Stripe", slug: "stripe" },
      { name: "HubSpot", slug: "hubspot" },
      { name: "Zapier", slug: "zapier" },
      { name: "Salesforce" },
      { name: "Shopify", slug: "shopify" },
      { name: "Twilio" },
    ],
  },
]

export type NavLink = { label: string; href: string; description?: string }
export type NavGroup = { label: string; href?: string; links: NavLink[] }

/** Services mega-menu columns, by service slug (details come from content/services). */
export const serviceMenu: { title: string; blurb: string; slugs: string[] }[] = [
  { title: "Build", blurb: "Products your customers use", slugs: ["software-development", "web-development", "mobile-app-development", "saas-development"] },
  { title: "Intelligent", blurb: "AI, data and automation", slugs: ["ai-solutions", "automation-integrations", "data-analytics"] },
  { title: "Business", blurb: "Systems that run operations", slugs: ["crm-business-systems", "ecommerce", "ui-ux-design"] },
  { title: "Infrastructure", blurb: "Reliable, secure foundations", slugs: ["cloud-devops", "cybersecurity", "maintenance-support"] },
]

export type HeaderItem =
  | { kind: "services"; label: string; href: string }
  | { kind: "industries"; label: string; href: string }
  | { kind: "list"; label: string; links: NavLink[] }
  | { kind: "link"; label: string; href: string }

export const headerNav: HeaderItem[] = [
  { kind: "services", label: "Services", href: "/services" },
  {
    kind: "list",
    label: "Solutions",
    links: [
      { label: "Startups", href: "/solutions/startups", description: "From idea to a first product customers can use" },
      { label: "Small & Medium Businesses", href: "/solutions/small-medium-businesses", description: "Practical systems that save time" },
      { label: "Growing Businesses", href: "/solutions/growing-businesses", description: "Software that keeps up with growth" },
      { label: "Enterprise", href: "/solutions/enterprise", description: "Complex platforms and integrations" },
      { label: "Digital Transformation", href: "/solutions/digital-transformation", description: "Modernise how the business runs" },
    ],
  },
  { kind: "industries", label: "Industries", href: "/industries" },
  { kind: "link", label: "Technologies", href: "/technologies" },
  { kind: "link", label: "Selected Work", href: "/work" },
  {
    kind: "list",
    label: "Insights",
    links: [
      { label: "Blog", href: "/blog", description: "Guides on software, AI and business technology" },
      { label: "Pricing Guide", href: "/pricing", description: "Indicative project investment ranges" },
      { label: "FAQ", href: "/faq", description: "Answers to common questions" },
    ],
  },
  {
    kind: "list",
    label: "Company",
    links: [
      { label: "About", href: "/about", description: "Who we are and what we believe" },
      { label: "Our Process", href: "/process", description: "How projects move from idea to launch" },
      { label: "Contact", href: "/contact", description: "Talk to our team" },
    ],
  },
]

export const footerNav: NavGroup[] = [
  {
    label: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Our Process", href: "/process" },
      { label: "Selected Work", href: "/work" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    label: "Services",
    links: [
      { label: "Software Development", href: "/services/software-development" },
      { label: "Web Development", href: "/services/web-development" },
      { label: "Mobile Apps", href: "/services/mobile-app-development" },
      { label: "AI Solutions", href: "/services/ai-solutions" },
      { label: "CRM", href: "/services/crm-business-systems" },
      { label: "Automation", href: "/services/automation-integrations" },
      { label: "E-commerce", href: "/services/ecommerce" },
      { label: "Cloud & DevOps", href: "/services/cloud-devops" },
    ],
  },
  {
    label: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "FAQ", href: "/faq" },
      { label: "Pricing", href: "/pricing" },
      { label: "Industries", href: "/industries" },
      { label: "Technologies", href: "/technologies" },
    ],
  },
  {
    label: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Cookie Policy", href: "/cookie-policy" },
    ],
  },
]
