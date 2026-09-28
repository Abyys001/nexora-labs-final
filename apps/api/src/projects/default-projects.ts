import type { NewProjectRow } from "../db/schema.js";

/**
 * Seed portfolio, written from what each live site actually does. Every
 * capability below is visible on the project's own website — no metrics,
 * outcomes, awards or testimonials are asserted anywhere in this file, and
 * nothing here should be added without being verifiable on the live site.
 * Seeded on first boot when the table is empty; editable from /admin/portfolio
 * afterwards.
 */
export const defaultProjects: NewProjectRow[] = [
  {
    slug: "molana-restaurant",
    title: "Molana Restaurant",
    client: "Molana Restaurant",
    industry: "Restaurant & Hospitality",
    category: "Restaurant Website",
    location: "Ealing, London",
    websiteUrl: "https://molanarestaurant.co.uk/",
    shortDescription: "A Persian fine-dining site where guests browse the menu, reserve a table and order online.",
    detailedDescription:
      "Molana is a Persian restaurant on Uxbridge Road in Ealing. The website is the restaurant's front door: it presents the kitchen and the room, carries the full menu, takes table reservations, and hands guests off to the ordering platform when they want to eat at home. It also carries the private-room and catering side of the business, which is enquiry-led rather than transactional.",
    clientNeed:
      "One place that could do three different jobs at once — convince someone to book a table, let a returning customer order without phoning, and take private-event enquiries — without any of them getting in the way of the others.",
    whatWeBuilt:
      "A presentation-first restaurant site with a structured reservation flow, a full menu organised by course, a photographic gallery of the room and the food, and dedicated sections for the private room and catering. Online ordering runs on a separate ordering platform, reached from a persistent call to action.",
    customerExperience:
      "Guests land on the room and the food, move through the menu by course, and reach a reservation form that captures party size, date, time, seating preference, occasion and dietary requirements in one pass. Ordering online is one tap away from every screen.",
    businessFunctionality:
      "Reservation enquiries arrive structured rather than as free text, so the front-of-house team can seat a booking without a follow-up call. Private-room and catering enquiries are separated from table bookings, because they are a different conversation with a different lead time.",
    services: ["web-development", "ui-ux-design"],
    capabilities: [
      "Table reservation form",
      "Full menu by course",
      "Online ordering hand-off",
      "Photographic gallery",
      "Private room enquiries",
      "Catering enquiries",
    ],
    technologies: ["Responsive web", "Reservation form", "Online ordering platform"],
    previewTheme: "amber",
    previewLayout: "hospitality",
    featured: true,
    homepageVisible: true,
    status: "published",
    sortOrder: 0,
  },
  {
    slug: "sumac-restaurant",
    title: "Sumac",
    client: "Sumac",
    industry: "Restaurant & Hospitality",
    category: "Restaurant Website",
    location: "Twickenham, London",
    websiteUrl: "https://sumacrestaurant.co.uk/",
    shortDescription: "A Persian restaurant site built around table booking, online ordering and private dining.",
    detailedDescription:
      "Sumac is a Persian restaurant on Church Street in Twickenham. The site introduces the kitchen through a small number of named dishes rather than a wall of photography, then routes visitors to the two things they actually came for: a table, or an order. Private dining is handled as its own section.",
    clientNeed:
      "A site that reads as considered as the room does, while still getting a visitor to a booking or an order in as few steps as possible.",
    whatWeBuilt:
      "A restrained single-narrative homepage with a dedicated table-booking page, a downloadable menu, an online-ordering hand-off, and a private-dining section. Availability notices can be surfaced at the top of the site when a date is fully booked.",
    customerExperience:
      "A short introduction, a few signature dishes named and described, then a booking form that asks for guests, date, time and any special requests. Anyone who wants to eat at home is one link from the ordering platform.",
    businessFunctionality:
      "Bookings are captured through a structured form and routed to the restaurant's booking platform. Fully-booked dates can be announced on the site rather than discovered by a customer mid-form.",
    services: ["web-development", "ui-ux-design"],
    capabilities: ["Table booking form", "Online ordering hand-off", "Downloadable menu", "Private dining section", "Availability notices"],
    technologies: ["Responsive web", "WordPress", "Booking platform integration"],
    previewTheme: "amber",
    previewLayout: "hospitality",
    featured: false,
    homepageVisible: true,
    status: "published",
    sortOrder: 1,
  },
  {
    slug: "phonigration",
    title: "Phoenix Immigration",
    client: "Phoenix Immigration (Phonigration)",
    industry: "Immigration & Professional Services",
    category: "Professional Services Platform",
    location: "Southall, London",
    websiteUrl: "https://phonigration.com/",
    shortDescription: "A bilingual immigration consultancy platform: eligibility assessment, service catalogue and client case access.",
    detailedDescription:
      "Phoenix Immigration advises on UK visa and immigration routes, and works largely with Farsi-speaking clients. The platform is more than a brochure: it opens with a free feasibility assessment, carries a catalogue of individual immigration services each with its own page, and gives existing clients a signed-in area for their case.",
    clientNeed:
      "Immigration enquiries arrive with wildly different circumstances. The site had to qualify an enquiry before a consultant spends time on it, explain a large number of distinct routes clearly, and work for an audience reading in Farsi as much as in English.",
    whatWeBuilt:
      "A bilingual Farsi/English experience with a feasibility assessment form, a requirements checker, a service catalogue of around twenty individual immigration routes each with its own page, a document-handling flow, a client login area, and a blog.",
    customerExperience:
      "A visitor starts with a free assessment rather than a contact form, sees the route that fits their situation explained on its own page, and — once they are a client — signs in to follow their case rather than emailing for an update.",
    businessFunctionality:
      "Enquiries arrive pre-qualified and categorised by route. A four-step process is shown to the client explicitly, so expectations about what happens next are set by the site rather than by a phone call.",
    services: ["web-development", "ui-ux-design", "software-development"],
    capabilities: [
      "Feasibility assessment form",
      "Requirements checker",
      "Service catalogue (~20 routes)",
      "Client login area",
      "Document handling",
      "Bilingual Farsi / English",
      "Blog",
    ],
    technologies: ["Responsive web", "Bilingual content", "Authenticated client area"],
    previewTheme: "azure",
    previewLayout: "services",
    featured: true,
    homepageVisible: true,
    status: "published",
    sortOrder: 2,
  },
  {
    slug: "lotus-print",
    title: "Lotus Print",
    client: "Lotus Print — Signs & Printing",
    industry: "Print & E-commerce",
    category: "E-commerce Platform",
    location: "Southall, London",
    websiteUrl: "https://lotusprintshop.com/",
    shortDescription: "A custom print and signage e-commerce platform with per-product configuration, a sign builder and order tracking.",
    detailedDescription:
      "Lotus Print sells printed and fabricated products — business cards, banners, signage, packaging, vehicle graphics, apparel — where almost nothing has a single fixed price. The platform is built around that: every product is configured before it is priced, and the catalogue is broad enough to need real navigation rather than a single product list.",
    clientNeed:
      "Print pricing depends on size, material, finish and quantity, so a conventional fixed-price storefront doesn't work. The business also sells adjacent services — design, web, digital signage — that had to sit alongside the shop without confusing it.",
    whatWeBuilt:
      "A category-driven catalogue across more than fifteen product families, a configure-and-price step on each product, a dedicated Sign Builder, a digital-signage product line, cart, accounts and order tracking, plus a knowledge base and blog for the questions that would otherwise become phone calls.",
    customerExperience:
      "A customer browses by category, opens a product, configures it — dimensions, material, finish, quantity, artwork — and sees the price for what they actually specified. After ordering, they track progress from the same account.",
    businessFunctionality:
      "Specification is captured at the point of order instead of being chased by email, so a job arrives at the press ready to run. Order tracking and the knowledge base absorb the routine status and how-to questions.",
    services: ["ecommerce", "web-development", "ui-ux-design"],
    capabilities: [
      "Category-driven catalogue",
      "Configure & price per product",
      "Sign Builder tool",
      "Digital signage line",
      "Cart & customer accounts",
      "Order tracking",
      "Knowledge base",
      "Blog",
    ],
    technologies: ["Responsive web", "Custom commerce platform", "Cloud image delivery"],
    previewTheme: "violet",
    previewLayout: "commerce",
    featured: true,
    homepageVisible: true,
    status: "published",
    sortOrder: 3,
  },
  {
    slug: "bourne-hill-tyre-mot",
    title: "Bourn Hill Tyre & MOT",
    client: "Bourn Hill Tyre & MOT",
    industry: "Automotive",
    category: "Booking System",
    location: "Palmers Green, London",
    websiteUrl: "https://bournehilltyreandmot.co.uk/",
    shortDescription: "An independent tyre and MOT garage site with a custom vehicle-first booking form.",
    detailedDescription:
      "Bourn Hill Tyre & MOT is an independent garage in Palmers Green offering tyres, mobile tyre fitting and MOT testing. The site is deliberately small and does one job properly: get a vehicle booked in without a phone call.",
    clientNeed:
      "A garage booking is only useful if it arrives with the vehicle details attached. A generic contact form produces bookings the workshop then has to phone back about.",
    whatWeBuilt:
      "A focused site for the three service lines with a custom booking form that captures the vehicle first — registration, make, model, year, colour and fuel type — then the customer's details, the service required, and a date and time.",
    customerExperience:
      "A visitor picks the service they need, fills in the vehicle and their contact details, chooses a slot, and is done. No account, no sign-in, no third-party booking widget to get lost in.",
    businessFunctionality:
      "Every booking arrives with enough vehicle information for the workshop to allocate the right bay and time without calling the customer back.",
    services: ["web-development", "software-development"],
    capabilities: ["Vehicle-first booking form", "Fuel-type and vehicle capture", "Service selection", "Date and time picker", "Service pages for tyres, mobile tyre and MOT"],
    technologies: ["Responsive web", "Custom booking form"],
    previewTheme: "steel",
    previewLayout: "booking",
    featured: false,
    homepageVisible: true,
    status: "published",
    sortOrder: 4,
  },
  {
    slug: "mot-centre-tooting",
    title: "MOT Centre Tooting",
    client: "Auto Centre Tooting / MOT Centre Tooting",
    industry: "Automotive / MOT",
    category: "Booking & Payment Flow",
    location: "Tooting, London",
    websiteUrl: "https://motcentretooting.uk/",
    shortDescription: "A garage site built around an eight-step booking flow with registration lookup and an online payment step.",
    detailedDescription:
      "MOT Centre Tooting is a garage on Garratt Lane offering MOT testing, servicing, repairs and diagnostics. The site is organised entirely around its booking flow: a visitor enters a registration, picks a service, chooses a slot, reviews and pays, all in a single guided sequence.",
    clientNeed:
      "Garage customers compare on price and availability. The site needed to publish both openly and then let someone commit in the same visit, rather than sending them to a phone queue.",
    whatWeBuilt:
      "An eight-step booking flow — vehicle, service, date, time, details, review, payment, confirmation — with vehicle lookup by registration number, a published service and pricing table, a promotional code step, a how-it-works explainer and an FAQ accordion.",
    customerExperience:
      "Registration in, services and slots out, review, pay, done. Progress is shown at every step, so it is always clear how much is left.",
    businessFunctionality:
      "Slots are booked and paid for before the car arrives, which makes the day's schedule real rather than provisional. Published pricing and an FAQ handle the questions that otherwise arrive by phone.",
    services: ["web-development", "software-development", "ui-ux-design"],
    capabilities: [
      "Eight-step booking flow",
      "Registration lookup",
      "Service and slot selection",
      "Online payment step",
      "Published pricing table",
      "Promotional codes",
      "FAQ accordion",
    ],
    technologies: ["Responsive web", "Custom booking engine", "Online payments"],
    previewTheme: "azure",
    previewLayout: "booking",
    featured: false,
    homepageVisible: true,
    status: "published",
    sortOrder: 5,
  },
]
