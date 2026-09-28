import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Blocks,
  BrainCircuit,
  Cloud,
  Globe,
  LifeBuoy,
  Layers,
  PenTool,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Users,
  Workflow,
} from "lucide-react"
import type { BrandIconName } from "@/components/icons/brand-icons"

export type Item = { title: string; description: string }
export type Faq = { question: string; answer: string }

export type Service = {
  slug: string
  name: string
  navLabel: string
  icon: LucideIcon
  brandIcon: BrandIconName
  category: "Build" | "Intelligent" | "Business" | "Infrastructure"
  summary: string
  seoTitle: string
  seoDescription: string
  hero: { title: string; intro: string }
  problem: { title: string; intro: string; points: string[] }
  provides: Item[]
  includes: string[]
  useCases: Item[]
  benefits: Item[]
  price: { range: string; note: string }
  faqs: Faq[]
  cta: string
}

export const services: Service[] = [
  {
    slug: "software-development",
    name: "Software Development",
    navLabel: "Software Development",
    icon: Blocks,
    brandIcon: "software-development",
    category: "Build",
    summary: "Custom software designed around your business processes.",
    seoTitle: "Custom Software Development Company",
    seoDescription:
      "Custom software development for businesses that have outgrown spreadsheets and off-the-shelf tools. Indicative pricing from £4,000.",
    hero: {
      title: "Software That Fits the Way You Work",
      intro:
        "When off-the-shelf tools force your team into workarounds, custom software brings everything into one place, shaped around your processes, your customers and your plans for growth.",
    },
    problem: {
      title: "When generic tools stop fitting",
      intro: "Most businesses reach a point where the software they rely on starts slowing them down.",
      points: [
        "Critical work lives in spreadsheets that only one person understands",
        "Teams copy the same information between several different tools",
        "Off-the-shelf products can't handle the way your business really operates",
        "Licence costs keep rising while the fit keeps getting worse",
      ],
    },
    provides: [
      { title: "Business analysis", description: "We map how work flows today and where software can remove friction." },
      { title: "Bespoke applications", description: "Web-based systems built around your exact processes and roles." },
      { title: "Modernising older systems", description: "Rebuild or extend legacy software without disrupting daily operations." },
      { title: "Integrations", description: "Connect your new system to the tools you already depend on." },
    ],
    includes: [
      "Discovery and requirements workshops",
      "User roles and permissions",
      "Dashboards and reporting",
      "Workflow and approval logic",
      "Data migration from existing tools",
      "Secure hosting and backups",
      "Documentation and handover",
      "Ongoing support options",
    ],
    useCases: [
      { title: "Operations platform", description: "Replace a patchwork of spreadsheets with one system for jobs, stock and scheduling." },
      { title: "Quoting and pricing tools", description: "Generate accurate quotes in minutes using your own pricing rules." },
      { title: "Compliance tracking", description: "Keep records, certificates and deadlines in one auditable place." },
      { title: "Internal portals", description: "Give staff a single place to find information and complete tasks." },
    ],
    benefits: [
      { title: "Less manual work", description: "Automate the repetitive steps your team does every day." },
      { title: "One source of truth", description: "Everyone works from the same accurate, up-to-date information." },
      { title: "You own it", description: "No per-seat licences for software designed around you." },
      { title: "Built to grow", description: "Add features as the business evolves rather than starting again." },
    ],
    price: { range: "£4,000 – £35,000+", note: "Most custom systems sit between £7,000 and £25,000." },
    faqs: [
      { question: "Is custom software worth it compared to off-the-shelf tools?", answer: "It is when your processes are a competitive advantage or when you are paying for several tools that each do part of the job. We will tell you honestly if an existing product would serve you better." },
      { question: "Can you replace our existing system gradually?", answer: "Yes. We often run a new system alongside the old one and migrate one area at a time to reduce risk." },
      { question: "Who owns the software?", answer: "On completion and final payment, you own the code we write for your project." },
    ],
    cta: "Discuss a Software Project",
  },
  {
    slug: "web-development",
    name: "Web Development",
    navLabel: "Web Development",
    icon: Globe,
    brandIcon: "web-development",
    category: "Build",
    summary: "Professional websites, web applications and digital platforms.",
    seoTitle: "Web Development & Web Application Development",
    seoDescription:
      "Professional websites and custom web applications for growing businesses: fast, accessible, search-friendly and easy to manage. Projects from £2,000.",
    hero: {
      title: "Websites and Web Apps That Work as Hard as You Do",
      intro:
        "From a polished company website to a customer portal used every day, we build fast, accessible web experiences that make your business easier to find, understand and work with.",
    },
    problem: {
      title: "Your website should be an asset, not an afterthought",
      intro: "A slow or outdated website quietly costs you enquiries and credibility.",
      points: [
        "Visitors can't quickly understand what you do or how to contact you",
        "Pages load slowly, especially on mobile",
        "Updating content needs a developer every time",
        "Customers email or phone for things they could do online",
      ],
    },
    provides: [
      { title: "Business websites", description: "Clear, credible websites that explain what you do and generate enquiries." },
      { title: "Web applications", description: "Portals, dashboards and booking tools that customers and staff use daily." },
      { title: "Content management", description: "Edit pages, articles and case studies yourself, without technical help." },
      { title: "Performance and SEO", description: "Fast pages, clean structure and search-friendly foundations." },
    ],
    includes: [
      "Responsive design for every screen size",
      "Content structure and page planning",
      "Contact and enquiry forms",
      "Search engine foundations",
      "Analytics setup",
      "Accessibility best practice",
      "Customer accounts and portals",
      "Hosting and launch support",
    ],
    useCases: [
      { title: "Company website", description: "A credible, modern site for a business that has outgrown its first website." },
      { title: "Customer portal", description: "Let customers view orders, documents and updates without calling." },
      { title: "Booking system", description: "Online booking with availability, reminders and payments." },
      { title: "Internal dashboard", description: "Bring key numbers from different tools into one live view." },
    ],
    benefits: [
      { title: "More enquiries", description: "Clear messaging and obvious next steps convert more visitors." },
      { title: "Faster everywhere", description: "Modern build techniques keep pages quick on any device." },
      { title: "Easy to manage", description: "Update content yourself whenever you need to." },
      { title: "Ready to extend", description: "Start with a website and add portals or tools later." },
    ],
    price: { range: "£2,000 – £10,000", note: "Websites from £2,000; web applications typically £4,000 – £10,000." },
    faqs: [
      { question: "Can I update the website myself?", answer: "Yes. Where it makes sense we include a content management system so you can edit pages and publish articles." },
      { question: "Do you write the content?", answer: "We help structure your content and can refine the copy you provide. Full copywriting can be included in the scope." },
      { question: "Will my website work on mobile?", answer: "Every site we build is designed and tested for phones, tablets and desktops." },
    ],
    cta: "Discuss a Web Project",
  },
  {
    slug: "mobile-app-development",
    name: "Mobile App Development",
    navLabel: "Mobile Apps",
    icon: Smartphone,
    brandIcon: "mobile-development",
    category: "Build",
    summary: "Customer-facing and business mobile applications.",
    seoTitle: "Mobile App Development: iOS, Android & Cross-Platform",
    seoDescription:
      "Mobile app development for iOS and Android. Customer apps and business apps built cross-platform from one codebase. Indicative pricing £5,000 – £15,000+.",
    hero: {
      title: "Mobile Apps Your Customers and Team Will Actually Use",
      intro:
        "We design and build mobile apps for iOS and Android that are simple to use, reliable in the real world and connected to the rest of your business.",
    },
    problem: {
      title: "Mobile is where your customers already are",
      intro: "If your service still depends on phone calls, paper forms or a desktop-only website, you are adding friction.",
      points: [
        "Customers expect to book, order or check status from their phone",
        "Field staff rely on paper forms or messaging apps",
        "Your current app is slow, outdated or hard to maintain",
        "You have an app idea but don't know where to start",
      ],
    },
    provides: [
      { title: "Customer apps", description: "Loyalty, booking, ordering and account apps for your customers." },
      { title: "Business apps", description: "Tools for field teams, inspections, deliveries and on-site work." },
      { title: "Cross-platform builds", description: "One codebase for iOS and Android to keep costs sensible." },
      { title: "App store launch", description: "We handle submission, review and release to both stores." },
    ],
    includes: [
      "User experience and interface design",
      "iOS and Android apps",
      "Push notifications",
      "Offline support where needed",
      "Payments and subscriptions",
      "Admin dashboard for your team",
      "Connection to your existing systems",
      "App store submission",
    ],
    useCases: [
      { title: "Booking and ordering", description: "Let customers book services or order products in a few taps." },
      { title: "Field service", description: "Job lists, photos, signatures and forms that work without signal." },
      { title: "Membership and loyalty", description: "Keep customers engaged with rewards, content and offers." },
      { title: "Companion app", description: "A mobile experience that extends your existing web platform." },
    ],
    benefits: [
      { title: "Closer to customers", description: "Be one tap away on the device they use most." },
      { title: "Faster field work", description: "Capture information once, where the work happens." },
      { title: "One codebase", description: "Cross-platform development reduces cost and maintenance." },
      { title: "Connected", description: "Data flows straight into the systems your team already uses." },
    ],
    price: { range: "£5,000 – £15,000+", note: "Apps with complex back-office systems can sit higher." },
    faqs: [
      { question: "Do you build for both iOS and Android?", answer: "Yes. We usually build cross-platform, so one codebase serves both platforms, which keeps cost and upkeep down." },
      { question: "Do you publish the app to the stores?", answer: "Yes. We prepare store listings, handle submission and support you through the review process." },
      { question: "What happens after launch?", answer: "Operating systems change every year. We offer support plans to keep your app updated, secure and improving." },
    ],
    cta: "Discuss a Mobile App",
  },
  {
    slug: "ai-solutions",
    name: "AI Solutions",
    navLabel: "AI Solutions",
    icon: BrainCircuit,
    brandIcon: "ai-machine-learning",
    category: "Intelligent",
    summary: "AI-powered products, assistants, automation and intelligent workflows.",
    seoTitle: "AI Development Company: Practical AI Solutions for Business",
    seoDescription:
      "Practical AI solutions for businesses: AI assistants, chatbots, agents, document processing and intelligent search. Indicative pricing £3,000 – £15,000+.",
    hero: {
      title: "Put AI to Work for Your Business",
      intro:
        "We build practical AI solutions that help businesses automate work, improve customer experiences and make better use of their data.",
    },
    problem: {
      title: "AI is everywhere, but where does it help you?",
      intro: "Many businesses know AI could help but struggle to turn it into something reliable and useful.",
      points: [
        "Teams spend hours reading, sorting and re-typing documents",
        "Customers wait for answers to questions you've answered many times before",
        "Valuable knowledge is buried across files, inboxes and systems",
        "Experiments with AI tools never made it into daily operations",
      ],
    },
    provides: [
      { title: "AI assistants", description: "Assistants that answer questions using your own knowledge and documents." },
      { title: "AI chatbots", description: "Customer-facing chat that resolves common requests and hands over when needed." },
      { title: "AI agents", description: "Agents that complete multi-step tasks across your tools with human oversight." },
      { title: "Intelligent search", description: "Find the right answer across documents, tickets and records instantly." },
      { title: "Document processing", description: "Extract, classify and validate information from invoices, forms and contracts." },
      { title: "AI automation", description: "Add judgement to workflows: triage, summarise, draft and route." },
    ],
    includes: [
      "AI opportunity assessment",
      "AI assistants and chatbots",
      "AI agents",
      "Intelligent search",
      "Document processing",
      "AI automation",
      "AI-powered applications",
      "Business intelligence",
    ],
    useCases: [
      { title: "Customer support assistant", description: "Answer common questions instantly and route complex cases to your team." },
      { title: "Document intake", description: "Turn emailed PDFs and forms into structured data in your systems." },
      { title: "Internal knowledge assistant", description: "Help staff find policies, procedures and past work in seconds." },
      { title: "Sales and proposal drafting", description: "Draft tailored proposals and follow-ups from your own templates." },
    ],
    benefits: [
      { title: "Hours back every week", description: "Automate reading, sorting and drafting work." },
      { title: "Faster responses", description: "Customers get answers immediately, at any time of day." },
      { title: "Human in control", description: "Clear review steps where decisions matter." },
      { title: "Your data, protected", description: "Privacy and access controls designed in from the start." },
    ],
    price: { range: "£3,000 – £15,000+", note: "Focused assistants start around £3,000; AI-powered platforms sit higher." },
    faqs: [
      { question: "Is our data safe when using AI?", answer: "We design every AI solution with data protection in mind: choosing providers with appropriate data terms, limiting what is shared and controlling who can access what." },
      { question: "Can AI be added to our existing software?", answer: "Yes. AI features can be integrated into existing websites, applications and business systems." },
      { question: "How do you stop AI giving wrong answers?", answer: "We ground answers in your approved content, show sources, test against real questions and add human review where accuracy matters." },
      { question: "Where should we start with AI?", answer: "Usually with one repetitive, well-understood task. We can run a short discovery to identify where AI will make the clearest difference." },
    ],
    cta: "Discuss an AI Project",
  },
  {
    slug: "crm-business-systems",
    name: "CRM & Business Systems",
    navLabel: "CRM & Business Systems",
    icon: Users,
    brandIcon: "crm",
    category: "Business",
    summary: "Custom systems for managing customers, sales, operations and internal processes.",
    seoTitle: "Custom CRM Development & Business Systems",
    seoDescription:
      "Custom CRM and business systems that bring customers, sales and operations into one place, built around how your team works. Indicative pricing £7,000 – £25,000.",
    hero: {
      title: "One System for Customers, Sales and Operations",
      intro:
        "We build custom CRMs and business systems that give your team one reliable place to manage customers, track work and see how the business is performing.",
    },
    problem: {
      title: "When information lives everywhere",
      intro: "As businesses grow, customer and operational data spreads across tools, inboxes and spreadsheets.",
      points: [
        "No single view of a customer, their history and what's outstanding",
        "Sales opportunities slip through the cracks",
        "Managers can't see performance without building reports by hand",
        "Generic CRMs need heavy customisation and still don't fit",
      ],
    },
    provides: [
      { title: "Custom CRM", description: "Customer records, pipelines and activity designed around your sales process." },
      { title: "Operations systems", description: "Jobs, projects, scheduling and resources in one place." },
      { title: "Staff and HR tools", description: "Onboarding, rotas, holidays and internal requests." },
      { title: "Business dashboards", description: "Live reporting on the numbers that matter to you." },
    ],
    includes: [
      "Customer and contact management",
      "Sales pipelines and forecasting",
      "Tasks, reminders and workflows",
      "Role-based access",
      "Email and calendar integration",
      "Documents and notes",
      "Reporting and dashboards",
      "Data import from existing tools",
    ],
    useCases: [
      { title: "Sales CRM", description: "Track leads from first contact to signed deal with a pipeline that matches your process." },
      { title: "Service management", description: "Manage customers, contracts, jobs and renewals together." },
      { title: "Account management", description: "Give account managers a full picture of every client relationship." },
      { title: "Management reporting", description: "Replace monthly spreadsheet reports with live dashboards." },
    ],
    benefits: [
      { title: "Complete customer view", description: "Every interaction and record in one place." },
      { title: "Nothing forgotten", description: "Automated reminders and follow-ups keep work moving." },
      { title: "Clear performance", description: "See what's working without building reports by hand." },
      { title: "Fits your process", description: "No bending your business around someone else's software." },
    ],
    price: { range: "£7,000 – £25,000", note: "Depends on the number of workflows, integrations and user roles." },
    faqs: [
      { question: "Why not use an off-the-shelf CRM?", answer: "Off-the-shelf CRMs work well for many businesses. Custom makes sense when your process is distinctive, you need deep integrations or licence costs are growing. We can advise either way." },
      { question: "Can you import our existing data?", answer: "Yes. We plan and test migration from spreadsheets and existing systems as part of the project." },
      { question: "Can it connect to our email and accounting tools?", answer: "Usually, yes. Most popular business tools offer ways to connect, and we will confirm this during discovery." },
    ],
    cta: "Discuss a Business System",
  },
  {
    slug: "automation-integrations",
    name: "Automation & Integrations",
    navLabel: "Automation & Integrations",
    icon: Workflow,
    brandIcon: "automation",
    category: "Business",
    summary: "Connect your tools and automate repetitive work.",
    seoTitle: "Business Process Automation & System Integrations",
    seoDescription:
      "Connect your business tools and automate repetitive work: data syncing, workflow automation and system integrations. Indicative pricing £2,500 – £10,000+.",
    hero: {
      title: "Connect Your Tools. Automate the Busywork.",
      intro:
        "We connect the systems you already use and automate the repetitive tasks in between, so information flows on its own and your team can focus on meaningful work.",
    },
    problem: {
      title: "Your team shouldn't be the integration",
      intro: "When tools don't talk to each other, people end up moving data by hand.",
      points: [
        "The same information is typed into several systems",
        "Errors creep in when data is copied manually",
        "Simple processes need several people and several steps",
        "Nobody is sure which system holds the correct figures",
      ],
    },
    provides: [
      { title: "System integrations", description: "Connect CRM, accounting, e-commerce, email and other platforms." },
      { title: "Workflow automation", description: "Trigger actions automatically when something happens in your business." },
      { title: "Data synchronisation", description: "Keep records consistent across every tool." },
      { title: "Custom connectors", description: "Build links to systems that don't connect out of the box." },
    ],
    includes: [
      "Process mapping",
      "Tool-to-tool integrations",
      "Automated notifications",
      "Scheduled reports",
      "Data validation and error alerts",
      "Approval flows",
      "Monitoring and logging",
      "Documentation",
    ],
    useCases: [
      { title: "Order to invoice", description: "Orders automatically create invoices and update stock." },
      { title: "Lead routing", description: "New enquiries land in your CRM and reach the right person immediately." },
      { title: "Onboarding flows", description: "New customers or staff trigger accounts, emails and tasks automatically." },
      { title: "Automated reporting", description: "Weekly reports compiled and delivered without anyone touching a spreadsheet." },
    ],
    benefits: [
      { title: "Fewer errors", description: "Data entered once and synced reliably." },
      { title: "Faster processes", description: "Steps that took days happen in minutes." },
      { title: "Scales with volume", description: "Handle more work without adding admin." },
      { title: "Visible and monitored", description: "Alerts when something needs attention." },
    ],
    price: { range: "£2,500 – £10,000+", note: "Single integrations start lower; multi-system automation sits higher." },
    faqs: [
      { question: "Which tools can you integrate?", answer: "Most modern business software offers ways to connect. We will review your tools during discovery and confirm what is possible." },
      { question: "What happens if an integration fails?", answer: "We build in monitoring, retries and alerts so problems are spotted and resolved quickly." },
      { question: "Can we start small?", answer: "Yes. Automating one high-value process first is often the best way to prove the benefit." },
    ],
    cta: "Discuss an Automation Project",
  },
  {
    slug: "ecommerce",
    name: "E-commerce",
    navLabel: "E-commerce",
    icon: ShoppingBag,
    brandIcon: "ecommerce",
    category: "Business",
    summary: "Online stores, marketplaces and custom commerce platforms.",
    seoTitle: "E-commerce Development: Online Stores & Commerce Platforms",
    seoDescription:
      "E-commerce development for brands and retailers: online stores, marketplaces, B2B ordering and custom commerce workflows. Indicative pricing £3,000 – £20,000+.",
    hero: {
      title: "Commerce Built Around How You Sell",
      intro:
        "Whether you're launching your first online store or need a custom platform for complex ordering, we build commerce experiences that are easy to buy from and easy to run.",
    },
    problem: {
      title: "Selling online shouldn't mean compromising",
      intro: "Standard store templates work until your business needs something different.",
      points: [
        "Checkout drop-off is high and hard to diagnose",
        "Stock, orders and accounts are managed in separate places",
        "B2B pricing, bundles or subscriptions don't fit the platform",
        "The store is slow and difficult to update",
      ],
    },
    provides: [
      { title: "Online stores", description: "Fast, attractive storefronts that convert on every device." },
      { title: "Custom commerce", description: "Trade pricing, configurators, subscriptions and bespoke workflows." },
      { title: "Marketplaces", description: "Multi-vendor platforms with onboarding, payouts and moderation." },
      { title: "Commerce integrations", description: "Connect stock, fulfilment, accounting and marketing tools." },
    ],
    includes: [
      "Product catalogue and search",
      "Secure checkout and payments",
      "Customer accounts",
      "Discounts and promotions",
      "Subscriptions",
      "Stock and order management",
      "Shipping and fulfilment integration",
      "Analytics",
    ],
    useCases: [
      { title: "Direct-to-consumer store", description: "A branded store that tells your story and sells your products." },
      { title: "B2B ordering portal", description: "Trade customers order at their own prices with account terms." },
      { title: "Subscription commerce", description: "Recurring orders with self-service management." },
      { title: "Multi-vendor marketplace", description: "Bring sellers and buyers together on your platform." },
    ],
    benefits: [
      { title: "Better conversion", description: "A smoother journey from product to payment." },
      { title: "Less admin", description: "Orders, stock and invoices flow automatically." },
      { title: "Flexible selling", description: "Support the pricing and models your business needs." },
      { title: "Room to grow", description: "Add channels, markets and features over time." },
    ],
    price: { range: "£3,000 – £20,000+", note: "Template-based stores start lower; custom platforms and marketplaces sit higher." },
    faqs: [
      { question: "Do you use an existing e-commerce platform or build custom?", answer: "Both. We recommend an established platform when it fits and build custom when your selling model requires it." },
      { question: "Can you migrate our existing store?", answer: "Yes, including products, customers and order history, while protecting your search rankings." },
      { question: "Which payment providers do you support?", answer: "We work with major payment providers and choose the right one for your markets and business model." },
    ],
    cta: "Discuss an E-commerce Project",
  },
  {
    slug: "cloud-devops",
    name: "Cloud & DevOps",
    navLabel: "Cloud & DevOps",
    icon: Cloud,
    brandIcon: "cloud",
    category: "Infrastructure",
    summary: "Reliable deployment, infrastructure and ongoing technical operations.",
    seoTitle: "Cloud & DevOps Services: Hosting, Deployment & Reliability",
    seoDescription:
      "Cloud hosting, deployment and DevOps services that keep your software secure, fast and reliable as you grow. Indicative pricing £2,000 – £12,000+.",
    hero: {
      title: "Reliable Technology Behind the Scenes",
      intro:
        "We set up and look after the infrastructure your software runs on, so it stays fast, secure and available as your business grows.",
    },
    problem: {
      title: "Downtime and slow releases cost more than you think",
      intro: "Infrastructure is invisible until something goes wrong.",
      points: [
        "Releases are risky, manual and happen rarely",
        "The site slows down or fails during busy periods",
        "Nobody is sure if backups actually work",
        "Hosting costs have grown without clear reason",
      ],
    },
    provides: [
      { title: "Cloud setup and migration", description: "Move to modern, well-structured cloud hosting safely." },
      { title: "Automated deployment", description: "Release updates quickly and safely, with easy rollback." },
      { title: "Monitoring and alerting", description: "Know about problems before your customers do." },
      { title: "Cost and security reviews", description: "Right-size infrastructure and close common security gaps." },
    ],
    includes: [
      "Infrastructure review",
      "Cloud hosting setup",
      "Automated testing and deployment",
      "Backups and recovery testing",
      "Monitoring and uptime alerts",
      "Security hardening",
      "Performance tuning",
      "Cost optimisation",
    ],
    useCases: [
      { title: "Hosting migration", description: "Move from ageing servers to reliable cloud hosting." },
      { title: "Release automation", description: "Turn a stressful manual release into a one-click process." },
      { title: "Scaling for growth", description: "Prepare for launches, campaigns and seasonal peaks." },
      { title: "Health check", description: "An independent review of reliability, security and cost." },
    ],
    benefits: [
      { title: "More uptime", description: "Fewer outages and faster recovery." },
      { title: "Faster releases", description: "Ship improvements safely and often." },
      { title: "Controlled costs", description: "Pay for what you need, not what was over-provisioned." },
      { title: "Peace of mind", description: "Backups, monitoring and security you can rely on." },
    ],
    price: { range: "£2,000 – £12,000+", note: "Health checks start lower; migrations and ongoing operations are scoped individually." },
    faqs: [
      { question: "Which cloud providers do you work with?", answer: "We work with the major cloud providers and choose based on your needs, budget and existing setup." },
      { question: "Can you take over infrastructure someone else set up?", answer: "Yes. We start with a review, document what exists and then improve it step by step." },
      { question: "Do you offer ongoing monitoring?", answer: "Yes, as part of our maintenance and support plans." },
    ],
    cta: "Discuss Your Infrastructure",
  },
  {
    slug: "ui-ux-design",
    name: "UI/UX & Product Design",
    navLabel: "UI/UX Design",
    icon: PenTool,
    brandIcon: "ui-ux",
    category: "Build",
    summary: "Simple, modern and user-friendly digital experiences.",
    seoTitle: "UI/UX & Product Design Services",
    seoDescription:
      "UI/UX and product design for websites, apps and software: research, user journeys, prototypes and design systems. Indicative pricing £2,000 – £10,000+.",
    hero: {
      title: "Design That Makes Complex Things Feel Simple",
      intro:
        "Good design is how customers decide whether to trust you. We design clear, modern digital products that people understand immediately and enjoy using.",
    },
    problem: {
      title: "If people can't use it, it doesn't work",
      intro: "Confusing products cost you customers, support time and adoption.",
      points: [
        "Users get stuck, give up or call for help",
        "The product looks dated next to competitors",
        "Every screen looks slightly different",
        "You're about to build but haven't tested the idea with real users",
      ],
    },
    provides: [
      { title: "Product discovery", description: "Understand users, goals and the problems worth solving." },
      { title: "User journeys and wireframes", description: "Map the experience before investing in visual detail." },
      { title: "Interface design", description: "Polished, accessible screens ready for development." },
      { title: "Design systems", description: "Reusable components that keep products consistent as they grow." },
    ],
    includes: [
      "User research and interviews",
      "Journey mapping",
      "Wireframes",
      "Interactive prototypes",
      "Visual interface design",
      "Accessibility review",
      "Design system",
      "Developer handover",
    ],
    useCases: [
      { title: "New product design", description: "Shape a new idea into a testable prototype before development." },
      { title: "Product redesign", description: "Modernise an existing application without losing what users rely on." },
      { title: "UX audit", description: "Identify where users struggle and what to fix first." },
      { title: "Design system", description: "Create a consistent visual language across products." },
    ],
    benefits: [
      { title: "Higher adoption", description: "Products people understand get used." },
      { title: "Lower build risk", description: "Test ideas before committing development budget." },
      { title: "Consistent brand", description: "A professional, coherent experience everywhere." },
      { title: "Faster development", description: "Clear designs and components speed up the build." },
    ],
    price: { range: "£2,000 – £10,000+", note: "Standalone design projects; design is also included within our build projects." },
    faqs: [
      { question: "Is design included in your development projects?", answer: "Yes. Every build project includes design proportionate to the scope. Standalone design is available too." },
      { question: "Can you work with our existing brand?", answer: "Absolutely. We extend your brand into a digital product rather than replacing it." },
      { question: "Will we see designs before development starts?", answer: "Yes. You will review and approve designs and prototypes before we build." },
    ],
    cta: "Discuss a Design Project",
  },
  {
    slug: "maintenance-support",
    name: "Maintenance & Support",
    navLabel: "Maintenance & Support",
    icon: LifeBuoy,
    brandIcon: "devops",
    category: "Infrastructure",
    summary: "Continuous improvements, support and technical maintenance.",
    seoTitle: "Software Maintenance & Support Plans",
    seoDescription:
      "Ongoing software maintenance and support: updates, security patches, monitoring and continuous improvements after launch. Plans from £300 per month.",
    hero: {
      title: "Support That Keeps Your Product Moving Forward",
      intro:
        "Launch is the beginning. We keep your software secure, up to date and improving, so it continues to serve your business long after go-live.",
    },
    problem: {
      title: "Software needs care to stay valuable",
      intro: "Without ongoing attention, even well-built software becomes a risk.",
      points: [
        "Security updates are missed or postponed",
        "Small bugs pile up and frustrate users",
        "Your original developer is no longer available",
        "Improvement ideas never get prioritised",
      ],
    },
    provides: [
      { title: "Maintenance", description: "Updates, security patches and dependency upgrades." },
      { title: "Support", description: "A clear route to report issues and get them resolved." },
      { title: "Continuous improvement", description: "A regular allowance for new features and refinements." },
      { title: "Takeover of existing products", description: "We can support software built by another team after a review." },
    ],
    includes: [
      "Security updates",
      "Bug fixes",
      "Uptime monitoring",
      "Backups",
      "Performance checks",
      "Monthly improvement time",
      "Priority support options",
      "Regular progress reporting",
    ],
    useCases: [
      { title: "After launch", description: "Keep a newly launched product healthy and improving." },
      { title: "Inherited software", description: "Take over a product whose original developer has moved on." },
      { title: "Growing products", description: "A steady cadence of new features driven by user feedback." },
      { title: "Business-critical systems", description: "Monitoring and priority response for systems you rely on." },
    ],
    benefits: [
      { title: "Reduced risk", description: "Security and stability handled proactively." },
      { title: "Predictable cost", description: "A clear monthly plan instead of surprise invoices." },
      { title: "Continuity", description: "A team that knows your product and your business." },
      { title: "Always improving", description: "Your product gets better month by month." },
    ],
    price: { range: "From £300 / month", note: "Plans are scoped to your product's size, criticality and improvement needs." },
    faqs: [
      { question: "Can you support software you didn't build?", answer: "Yes. We start with a technical review to understand the product, then agree a support plan." },
      { question: "What response times do you offer?", answer: "Response times depend on the plan and are agreed up front, with faster options for business-critical systems." },
      { question: "Can unused hours roll over?", answer: "Plan terms vary; we agree what works best for your product before starting." },
    ],
    cta: "Discuss Ongoing Support",
  },
  {
    slug: "saas-development",
    name: "SaaS Development",
    navLabel: "SaaS Development",
    icon: Layers,
    brandIcon: "saas",
    category: "Build",
    summary: "Multi-tenant SaaS products built to onboard, bill and scale from day one.",
    seoTitle: "SaaS Development Company: Build and Scale SaaS Products",
    seoDescription:
      "SaaS development for founders and businesses building subscription products: multi-tenant architecture, billing, admin and scalable infrastructure. Indicative pricing £10,000 – £35,000.",
    hero: {
      title: "SaaS Products Built to Scale From the Start",
      intro:
        "We design and build multi-tenant SaaS platforms with the accounts, billing and admin foundations that let you onboard your first customer and your thousandth without rebuilding.",
    },
    problem: {
      title: "Most SaaS ideas stall on the foundations",
      intro: "The features that make a demo impressive aren't the ones that make a SaaS product sustainable.",
      points: [
        "No clear plan for accounts, permissions or multi-tenancy",
        "Billing and subscription logic bolted on as an afterthought",
        "Uncertainty about what to build first versus later",
        "Architecture that works for ten users but not ten thousand",
      ],
    },
    provides: [
      { title: "Product scoping", description: "Define a first version that proves the model without over-building." },
      { title: "Multi-tenant architecture", description: "Accounts, workspaces and data isolation designed correctly from the start." },
      { title: "Billing and subscriptions", description: "Plans, trials, upgrades and payment provider integration." },
      { title: "Admin and analytics", description: "Internal tools to support customers and understand usage." },
    ],
    includes: [
      "Product and pricing model scoping",
      "Multi-tenant account architecture",
      "Subscription billing integration",
      "Role-based access and permissions",
      "Onboarding flows",
      "Usage analytics and admin dashboard",
      "Scalable cloud infrastructure",
      "API foundations for integrations",
    ],
    useCases: [
      { title: "New SaaS product", description: "Take a validated idea from scoping to a paying-customer-ready platform." },
      { title: "Internal tool to SaaS", description: "Turn a tool built for one client into a product you can sell to many." },
      { title: "Rebuild for scale", description: "Re-architect an early SaaS product that has outgrown its foundations." },
      { title: "Vertical SaaS", description: "Software built specifically for the workflows of one industry." },
    ],
    benefits: [
      { title: "Ready to onboard", description: "Accounts and billing that work from your first customer." },
      { title: "Built to scale", description: "Architecture that doesn't need rebuilding as you grow." },
      { title: "Faster iteration", description: "Solid foundations make new features quicker to ship." },
      { title: "Clear usage data", description: "Understand adoption and revenue from day one." },
    ],
    price: { range: "£10,000 – £35,000", note: "Depends on the number of user roles, integrations and billing complexity." },
    faqs: [
      { question: "Do you help decide what to build first?", answer: "Yes. We start with scoping to identify the smallest version of the product that proves the model, then plan what comes next." },
      { question: "Which billing providers do you support?", answer: "We integrate with major subscription billing providers and choose the right fit for your pricing model and markets." },
      { question: "Can the product support multiple customer accounts?", answer: "Yes. Multi-tenant architecture with proper data isolation is designed in from the start." },
      { question: "What happens as we grow?", answer: "We design for scale from the outset and can support ongoing development as usage and features grow." },
    ],
    cta: "Discuss a SaaS Project",
  },
  {
    slug: "data-analytics",
    name: "Data & Analytics",
    navLabel: "Data & Analytics",
    icon: BarChart3,
    brandIcon: "analytics",
    category: "Intelligent",
    summary: "Turn scattered data into dashboards and reports your team can act on.",
    seoTitle: "Data & Analytics Services: Dashboards and Reporting",
    seoDescription:
      "Data and analytics services that bring scattered business data into clear dashboards and reports. Indicative pricing £4,000 – £20,000.",
    hero: {
      title: "See What's Really Happening in Your Business",
      intro:
        "We bring data from across your systems into dashboards and reports that answer real questions, so decisions are based on what's happening now, not last month's spreadsheet.",
    },
    problem: {
      title: "Data everywhere, answers nowhere",
      intro: "Most businesses have plenty of data and very little insight, because it's scattered and hard to trust.",
      points: [
        "Reports are built by hand each month from several systems",
        "Different tools show different numbers for the same thing",
        "Nobody is confident the figures are current or correct",
        "Decisions rely on gut feel rather than evidence",
      ],
    },
    provides: [
      { title: "Data integration", description: "Bring data from your systems into one reliable place." },
      { title: "Dashboards and reporting", description: "Live views of the metrics that matter to your business." },
      { title: "Custom analytics", description: "Answer specific business questions with tailored reporting." },
      { title: "Data quality", description: "Clean, consistent and trustworthy figures across the business." },
    ],
    includes: [
      "Data source mapping",
      "Data pipelines and integration",
      "Data warehouse or store setup",
      "Dashboard and reporting design",
      "Role-based access to reports",
      "Automated data refreshes",
      "Historical and trend reporting",
      "Documentation and handover",
    ],
    useCases: [
      { title: "Executive dashboard", description: "A live view of revenue, performance and operations in one place." },
      { title: "Sales and marketing reporting", description: "Track pipeline, conversion and campaign performance together." },
      { title: "Operational reporting", description: "Monitor stock, jobs or service levels without manual reports." },
      { title: "Customer analytics", description: "Understand behaviour, retention and value across your customer base." },
    ],
    benefits: [
      { title: "One version of the truth", description: "Everyone works from the same reliable figures." },
      { title: "Hours saved monthly", description: "Reports that update themselves instead of being rebuilt by hand." },
      { title: "Faster decisions", description: "Current data, not last month's export." },
      { title: "Clearer priorities", description: "See what's actually driving performance." },
    ],
    price: { range: "£4,000 – £20,000", note: "Single dashboards start lower; multi-source data platforms sit higher." },
    faqs: [
      { question: "Can you work with the systems we already use?", answer: "Usually, yes. Most business systems offer ways to extract data, and we will confirm this during discovery." },
      { question: "Do we need a data warehouse?", answer: "Not always. For simpler needs we can report directly from your existing systems; larger or multi-source projects usually benefit from a dedicated data store." },
      { question: "How often is the data updated?", answer: "Refresh frequency is agreed per project, from real-time through to daily or weekly, depending on the need." },
    ],
    cta: "Discuss a Data Project",
  },
  {
    slug: "cybersecurity",
    name: "Cybersecurity & Compliance",
    navLabel: "Cybersecurity & Compliance",
    icon: ShieldCheck,
    brandIcon: "cybersecurity",
    category: "Infrastructure",
    summary: "Secure-by-design engineering, security reviews and compliance-readiness support.",
    seoTitle: "Cybersecurity & Compliance-Readiness Services",
    seoDescription:
      "Secure-by-design software engineering, security reviews and hardening to help your systems and processes work towards compliance readiness. Indicative pricing £3,000 – £15,000.",
    hero: {
      title: "Software Built to Withstand Scrutiny",
      intro:
        "We build systems with security considered from the first line of code, and review existing software and processes to close gaps before they become incidents.",
    },
    problem: {
      title: "Security is easier to design in than bolt on",
      intro: "Many security problems trace back to decisions made early in a project, when security wasn't yet a priority.",
      points: [
        "Sensitive data isn't clearly separated or access-controlled",
        "No one has reviewed the system since it was first built",
        "Customers or partners are asking about your security posture",
        "Preparing for a compliance framework feels overwhelming",
        "Past projects have accumulated security debt",
      ],
    },
    provides: [
      { title: "Secure-by-design engineering", description: "Build new systems with access control, encryption and validation designed in." },
      { title: "Security reviews", description: "Assess existing applications and infrastructure for common weaknesses." },
      { title: "Hardening", description: "Close gaps in configuration, access and data handling." },
      { title: "Compliance-readiness support", description: "Help preparing policies, evidence and controls ahead of a framework or audit." },
    ],
    includes: [
      "Architecture and code security review",
      "Access control and permissions review",
      "Data handling and encryption review",
      "Infrastructure and configuration hardening",
      "Dependency and vulnerability checks",
      "Security-focused documentation",
      "Compliance-readiness gap assessment",
      "Remediation support",
    ],
    useCases: [
      { title: "Pre-launch review", description: "A security review before a new product goes live." },
      { title: "Legacy system review", description: "Assess an existing system that has never had a formal review." },
      { title: "Compliance preparation", description: "Get systems and processes into better shape ahead of a framework or customer audit." },
      { title: "Ongoing hardening", description: "Regular reviews as part of a maintenance and support plan." },
    ],
    benefits: [
      { title: "Fewer weaknesses", description: "Issues found and fixed before they're exploited." },
      { title: "Stronger customer trust", description: "Answer security questions from customers and partners with confidence." },
      { title: "Compliance-ready foundations", description: "Evidence and controls in better shape ahead of an audit." },
      { title: "Built in, not bolted on", description: "Security considered from the first design decision." },
    ],
    price: { range: "£3,000 – £15,000", note: "Focused reviews start lower; ongoing hardening and compliance-readiness programmes sit higher." },
    faqs: [
      { question: "Can you get us officially certified?", answer: "No. We are not an accredited certification or penetration testing body. We help with secure-by-design engineering, reviews and compliance-readiness, and can recommend accredited partners for formal certification or penetration testing." },
      { question: "Is this the same as a penetration test?", answer: "No. Our reviews focus on secure design, code and configuration. For accredited penetration testing, we can point you to certified specialists and support you in acting on their findings." },
      { question: "Can you help with an existing compliance framework?", answer: "We can help get your engineering, documentation and processes into better shape ahead of a specific framework, working alongside your compliance or legal advisers." },
      { question: "Do you offer ongoing security support?", answer: "Yes, as part of our maintenance and support plans, including periodic reviews and dependency monitoring." },
    ],
    cta: "Discuss Security & Compliance",
  },
]

export function getService(slug: string) {
  return services.find((s) => s.slug === slug)
}
