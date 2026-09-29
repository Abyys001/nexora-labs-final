import type { LucideIcon } from "lucide-react"
import {
  Compass,
  Handshake,
  LineChart,
  Layers,
  MessagesSquare,
  ShieldCheck,
} from "lucide-react"

import type { Faq, Item } from "./services"

export const businessProblems: string[] = [
  "Manual processes",
  "Outdated software",
  "Poor customer experience",
  "Disconnected systems",
  "Data scattered across platforms",
  "Lack of automation",
  "Need for a new digital product",
]

export const whyCybercina: (Item & { icon: LucideIcon })[] = [
  { icon: Compass, title: "Business First", description: "We start with your business goals, not technology." },
  { icon: Layers, title: "Built Around You", description: "Every solution is designed around your actual requirements." },
  { icon: Handshake, title: "One Technology Partner", description: "Design, development, AI, integrations, deployment and ongoing support." },
  { icon: LineChart, title: "Scalable Solutions", description: "Build today with tomorrow's growth in mind." },
  { icon: MessagesSquare, title: "Clear Communication", description: "Simple communication and transparent project progress." },
  { icon: ShieldCheck, title: "Long-Term Support", description: "We can continue improving and supporting your product after launch." },
]

export const processSteps: Item[] = [
  { title: "Discover", description: "We understand your business, goals, users and challenges." },
  { title: "Plan", description: "We define the solution, scope, priorities and project roadmap." },
  { title: "Design", description: "We create the user experience and product interface." },
  { title: "Build", description: "Our team develops, integrates and tests the solution." },
  { title: "Launch & Grow", description: "We launch the product and continue supporting its growth." },
]

export type DetailedStep = Item & { activities: string[]; youGet: string }

export const detailedProcess: DetailedStep[] = [
  { title: "Discovery", description: "Understand the business and the problem.", activities: ["Conversations with key stakeholders", "Review of current processes and tools", "Clarify goals and success measures"], youGet: "A shared understanding of the problem worth solving" },
  { title: "Requirements", description: "Define what the product needs to accomplish.", activities: ["User types and key journeys", "Must-have versus later features", "Integrations and data needs"], youGet: "A clear, prioritised requirements list" },
  { title: "Planning", description: "Create scope, priorities and roadmap.", activities: ["Phasing and milestones", "Estimate and budget confirmation", "Risks and assumptions"], youGet: "A roadmap and a proposal you can make decisions with" },
  { title: "Design", description: "Design the product experience.", activities: ["Wireframes and user flows", "Visual interface design", "Clickable prototype for feedback"], youGet: "Approved designs before development begins" },
  { title: "Development", description: "Build the solution.", activities: ["Iterative delivery in short cycles", "Regular demos of working software", "Integrations and data migration"], youGet: "Visible progress you can review throughout" },
  { title: "Testing", description: "Quality assurance and validation.", activities: ["Automated and manual testing", "Acceptance testing with your team", "Performance and security checks"], youGet: "Confidence that it works as agreed" },
  { title: "Launch", description: "Deployment and production launch.", activities: ["Launch planning and go-live", "Training and handover", "Monitoring during launch"], youGet: "A smooth, well-supported launch" },
  { title: "Support", description: "Continuous improvement and maintenance.", activities: ["Updates and security patches", "Improvements based on feedback", "Ongoing monitoring"], youGet: "A product that keeps getting better" },
]

/** Compact 4-step preview used on the Contact page; full detail lives in `detailedProcess`. */
export const contactNextSteps: Item[] = [
  { title: "We read your message", description: "Every enquiry reaches our team directly — no ticketing queue, no chatbot triage." },
  { title: "We reply within one business day", description: "With clarifying questions or, if it's clear enough already, some initial thoughts on approach." },
  { title: "A short call or exchange", description: "We talk through what you're trying to achieve, on a call, over WhatsApp or by email — whatever suits you." },
  { title: "A written proposal", description: "Scope, approach and an indicative budget, so you can decide with your team before anything is agreed." },
]

/** What to put in a first message, and what we do with it. Shown on /contact. */
export const contactExpectations: { title: string; body: string }[] = [
  {
    title: "The problem, not the solution",
    body: "Tell us what is going wrong or what you want to be able to do. You do not need to know whether it is a web app, an automation or a CRM — working that out is our job.",
  },
  {
    title: "How it works today",
    body: "Spreadsheets, a legacy system, a manual process, nothing at all — whatever is there now. It tells us far more about scope than a feature list does.",
  },
  {
    title: "Who it is for",
    body: "Your customers, your team, or both. The number of people involved changes the shape of the build more than almost anything else.",
  },
  {
    title: "Any real constraints",
    body: "A date that cannot move, a budget ceiling, a system you must integrate with, a compliance requirement. We would rather design around a constraint than discover it late.",
  },
]

export const contactFaqs: Faq[] = [
  { question: "How quickly will I hear back?", answer: "We aim to reply to every enquiry within one business day, usually sooner." },
  { question: "What should I include in my message?", answer: "A short description of the problem or idea is enough to start. The more detail you can share, the more useful our first reply will be — our project builder can help structure this." },
  { question: "Do you offer a free first conversation?", answer: "Yes. The first call or exchange is unpaid and simply about understanding what you need and whether we're a good fit." },
  { question: "Can I call or message on WhatsApp instead of emailing?", answer: "Yes. Phone and WhatsApp both reach our team directly during business hours, and we're happy to continue there." },
  { question: "I don't have a fixed budget yet, is that a problem?", answer: "No. Tell us what you're trying to achieve and we'll help you understand realistic ranges before you commit to anything." },
  { question: "Do you work with businesses outside the UK?", answer: "Yes, we work remotely with clients in the UK and internationally, adapting communication to your time zone." },
]

export const aboutValues: Item[] = [
  { title: "Clarity over complexity", description: "Technology should simplify your business, not add to it. We explain decisions in plain language." },
  { title: "Outcomes over output", description: "We measure success by the difference software makes to your business, not by lines of code." },
  { title: "Honesty over hype", description: "We tell you what's worth building, what isn't, and what it's realistically likely to cost." },
  { title: "Partnership over projects", description: "The best results come from long-term relationships built on trust and shared goals." },
]

export const homeFaqs: Faq[] = [
  { question: "How much does a software project cost?", answer: "Projects typically start from around £2,000 and can exceed £50,000 depending on complexity. Our pricing page gives indicative ranges for common project types." },
  { question: "How long does a project take?", answer: "The timeline depends on scope and complexity. Smaller projects may take several weeks while larger platforms can take several months." },
  { question: "Can you work with an existing system?", answer: "Yes. We can improve, integrate, modernise or extend existing software." },
  { question: "Can you build AI into an existing application?", answer: "Yes. AI can be integrated into existing websites, applications and business systems." },
  { question: "Do you provide ongoing support?", answer: "Yes. Maintenance and long-term technical support can be provided after launch." },
  { question: "Can you work with international clients?", answer: "Yes. We work remotely with clients in the UK and internationally, adapting communication to your time zone." },
]

export const faqGroups: { title: string; faqs: Faq[] }[] = [
  {
    title: "Pricing & budgets",
    faqs: [
      homeFaqs[0],
      { question: "Do you offer fixed prices?", answer: "For well-defined scopes, yes. For evolving products we often work in phases, each with a clear budget, so you stay in control." },
      { question: "How are payments structured?", answer: "Typically as a deposit to start, followed by milestone payments. We agree this clearly before work begins." },
      { question: "Can we start small and grow the project later?", answer: "Yes, and we often recommend it. A focused first phase lets you see value early and make informed decisions about what comes next." },
    ],
  },
  {
    title: "Process & timelines",
    faqs: [
      homeFaqs[1],
      { question: "How involved do we need to be?", answer: "We need your input most during discovery, design reviews and testing. Beyond that, regular check-ins and demos keep you informed without taking much of your time." },
      { question: "How will we see progress?", answer: "Through regular demos of working software, a shared project board and concise progress updates." },
      { question: "What if our requirements change?", answer: "Change is normal. We review the impact on scope, time and cost together and agree the best way forward." },
    ],
  },
  {
    title: "Working together",
    faqs: [
      homeFaqs[5],
      homeFaqs[2],
      { question: "Will you sign an NDA?", answer: "Yes. We're happy to sign a mutual NDA before discussing sensitive details." },
      { question: "Who owns the code?", answer: "On completion and final payment, you own the code we write for your project." },
    ],
  },
  {
    title: "AI & technology",
    faqs: [
      homeFaqs[3],
      { question: "Is our data safe when using AI?", answer: "We design AI solutions with data protection in mind, choosing providers with appropriate data terms and controlling what information is shared." },
      { question: "Which technologies do you use?", answer: "We use modern, well-supported technologies chosen for reliability and long-term maintainability. We focus on what's right for your project rather than any single tool." },
    ],
  },
  {
    title: "Support",
    faqs: [
      homeFaqs[4],
      { question: "Can you support software built by someone else?", answer: "Yes. We begin with a technical review, then agree a plan to support and improve it." },
    ],
  },
]
