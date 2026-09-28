// Sample articles for launch. They are labelled as samples in the UI until
// replaced with published content.
export const blogCategories = [
  { slug: "ai", name: "AI" },
  { slug: "software", name: "Software" },
  { slug: "business-technology", name: "Business Technology" },
  { slug: "automation", name: "Automation" },
  { slug: "digital-transformation", name: "Digital Transformation" },
  { slug: "product-design", name: "Product Design" },
  { slug: "business-growth", name: "Business Growth" },
] as const

export type BlogCategorySlug = (typeof blogCategories)[number]["slug"]

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string }

export type Post = {
  slug: string
  title: string
  excerpt: string
  category: BlogCategorySlug
  publishedAt: string
  readingMinutes: number
  body: Block[]
}

export const posts: Post[] = [
  {
    slug: "how-much-does-custom-software-cost",
    title: "How Much Does Custom Software Cost in 2026?",
    excerpt: "A practical guide to what drives the cost of custom software and how to plan a realistic budget for your project.",
    category: "software",
    publishedAt: "2026-09-08",
    readingMinutes: 7,
    body: [
      { type: "p", text: "It's the first question almost every business asks, and the honest answer is: it depends. But that doesn't mean you can't plan. Understanding what drives cost helps you set a realistic budget and have a more productive conversation with any development partner." },
      { type: "h2", text: "Typical ranges" },
      { type: "ul", items: ["Business websites: £2,000 – £4,000", "Web applications and portals: £4,000 – £10,000", "Mobile applications: £5,000 – £15,000", "CRM and business systems: £7,000 – £25,000", "SaaS platforms: £10,000 – £35,000", "Enterprise platforms: £20,000 – £50,000+"] },
      { type: "h2", text: "What drives the cost" },
      { type: "p", text: "The biggest factors are the number of user types and workflows, how much business logic is involved, the integrations required and the depth of design. Migrating data from older systems and meeting specific security requirements also add effort." },
      { type: "h2", text: "How to keep costs under control" },
      { type: "ul", items: ["Start with the smallest version that delivers real value", "Prioritise ruthlessly and keep a 'later' list", "Reuse existing tools where they already work well", "Invest in discovery so you build the right thing first time"] },
      { type: "quote", text: "The most expensive software is the software that solves the wrong problem." },
      { type: "p", text: "A good partner will help you phase the work so that you see value early and make informed decisions about what comes next." },
    ],
  },
  {
    slug: "where-to-start-with-ai-in-your-business",
    title: "Where to Start With AI in Your Business",
    excerpt: "AI can feel overwhelming. Here's a simple way to find the first use case that will make a real difference.",
    category: "ai",
    publishedAt: "2026-08-27",
    readingMinutes: 6,
    body: [
      { type: "p", text: "Most businesses don't need an 'AI strategy' to get started. They need one well-chosen problem where AI can save time or improve customer experience, delivered reliably." },
      { type: "h2", text: "Look for repetitive knowledge work" },
      { type: "p", text: "The best early candidates are tasks that involve reading, sorting, summarising or answering the same kinds of questions again and again." },
      { type: "ul", items: ["Answering common customer questions", "Extracting information from documents", "Triaging and routing incoming requests", "Drafting first versions of routine documents"] },
      { type: "h2", text: "Keep a human in the loop" },
      { type: "p", text: "Start where mistakes are easy to catch. Build in review steps, show sources and measure accuracy against real examples before widening the scope." },
      { type: "h2", text: "Measure the outcome, not the technology" },
      { type: "p", text: "Define success in business terms, such as hours saved, faster response times or fewer errors, and track it from day one." },
    ],
  },
  {
    slug: "signs-you-have-outgrown-spreadsheets",
    title: "7 Signs Your Business Has Outgrown Spreadsheets",
    excerpt: "Spreadsheets are brilliant, until they become the system your business depends on. Here's how to tell.",
    category: "business-technology",
    publishedAt: "2026-08-12",
    readingMinutes: 5,
    body: [
      { type: "p", text: "Almost every business runs on spreadsheets at some point. The problem comes when they quietly become critical infrastructure." },
      { type: "ul", items: ["Only one person really understands how it works", "Several versions exist and nobody knows which is right", "People overwrite each other's changes", "Reporting takes days of manual work", "The same data is typed into several places", "Mistakes are only discovered after they cause problems", "It's slow, fragile or too large to open easily"] },
      { type: "h2", text: "What to do next" },
      { type: "p", text: "You don't have to replace everything at once. Start with the spreadsheet causing the most pain and consider whether an existing tool or a focused custom system would serve you better." },
    ],
  },
  {
    slug: "automating-repetitive-work-without-losing-control",
    title: "Automating Repetitive Work Without Losing Control",
    excerpt: "How to automate processes in a way your team trusts, with visibility, alerts and clear ownership.",
    category: "automation",
    publishedAt: "2026-07-29",
    readingMinutes: 6,
    body: [
      { type: "p", text: "Automation should make work more reliable, not more mysterious. The best automations are visible, monitored and owned." },
      { type: "h2", text: "Map the process first" },
      { type: "p", text: "Before automating, write down each step, who does it and what can go wrong. Automating a broken process just makes it break faster." },
      { type: "h2", text: "Design for exceptions" },
      { type: "ul", items: ["Validate data before acting on it", "Send clear alerts when something fails", "Provide a simple way for people to step in", "Log every action for later review"] },
      { type: "p", text: "Start with one high-volume, low-risk process, prove the benefit, and expand from there." },
    ],
  },
  {
    slug: "digital-transformation-for-smaller-businesses",
    title: "Digital Transformation Isn't Just for Large Companies",
    excerpt: "A practical, phased approach to modernising a smaller business, without a huge programme.",
    category: "digital-transformation",
    publishedAt: "2026-07-15",
    readingMinutes: 5,
    body: [
      { type: "p", text: "Digital transformation sounds like something that needs a big budget and a consultancy. For most businesses, it's a series of practical improvements delivered one at a time." },
      { type: "h2", text: "A simple framework" },
      { type: "ul", items: ["List where time, money or customers are being lost", "Rank them by impact and effort", "Deliver the top item properly", "Measure, learn and move to the next"] },
      { type: "p", text: "Small, well-chosen improvements compound. Within a year, the business can look and operate very differently." },
    ],
  },
  {
    slug: "why-design-before-development-saves-money",
    title: "Why Designing Before You Build Saves Money",
    excerpt: "Prototypes and user testing reduce risk and cost. Here's why design should come before development.",
    category: "product-design",
    publishedAt: "2026-06-30",
    readingMinutes: 4,
    body: [
      { type: "p", text: "Changing a design takes hours. Changing built software takes days or weeks. That's why testing ideas in design is one of the best investments in any project." },
      { type: "h2", text: "What good product design includes" },
      { type: "ul", items: ["Understanding users and their goals", "Mapping key journeys", "Wireframes to agree structure", "Interactive prototypes to test with real people", "A consistent design system for development"] },
      { type: "p", text: "The result is software that people understand from the first use, and a development phase with far fewer surprises." },
    ],
  },
  {
    slug: "choosing-a-software-development-partner",
    title: "How to Choose a Software Development Partner",
    excerpt: "The questions to ask, and the answers to listen for, when choosing who will build your software.",
    category: "business-growth",
    publishedAt: "2026-06-16",
    readingMinutes: 6,
    body: [
      { type: "p", text: "Choosing a development partner is one of the most important decisions in any software project. Price matters, but it's rarely the best predictor of success." },
      { type: "h2", text: "Questions worth asking" },
      { type: "ul", items: ["How do you make sure you understand our business?", "How will we see progress during the project?", "What happens if priorities change?", "Who owns the code and the data?", "What support is available after launch?"] },
      { type: "h2", text: "Signals to look for" },
      { type: "p", text: "Look for a partner who asks good questions, challenges assumptions, explains things clearly and is honest about trade-offs, including when something isn't worth building." },
    ],
  },
]

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug)
}

export function getCategory(slug: string) {
  return blogCategories.find((c) => c.slug === slug)
}
