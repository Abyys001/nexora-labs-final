import { ArrowRight, ArrowUpRight, Clock, Globe2, Mail, MessageCircle, Phone } from "lucide-react"
import Link from "next/link"

import { ContactTerminal } from "@/components/contact/contact-terminal"
import { ContactForm } from "@/components/forms/contact-form"
import { JsonLd } from "@/components/layout/json-ld"
import { Magnetic } from "@/components/motion/magnetic"
import { CtaSection } from "@/components/sections/cta-section"
import { FaqList } from "@/components/sections/faq-list"
import { PageHero } from "@/components/sections/page-hero"
import { ProcessSteps } from "@/components/sections/process-steps"
import { Eyebrow, Section, SectionHeader } from "@/components/sections/section"
import { Button } from "@/components/ui/button"
import { contactExpectations, contactFaqs, contactNextSteps } from "@/content/company"
import { getService } from "@/content/services"
import { serviceMenu, site } from "@/content/site"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Contact Us",
  description: "Talk to Cybercina about your software, AI, web or mobile project. Call, WhatsApp or send a project enquiry and we'll reply within one business day.",
  path: "/contact",
})

const channels = [
  { icon: Phone, label: "Phone", value: site.phone.display, href: site.phone.href, note: site.hours },
  { icon: MessageCircle, label: "WhatsApp", value: "Message us directly", href: site.whatsapp, external: true, note: "Fastest way to reach us on the move" },
  { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
  { icon: Clock, label: "Response time", value: site.responseTime },
  { icon: Globe2, label: "Location", value: site.location },
]

const serviceGroups = serviceMenu.map((group) => ({
  ...group,
  services: group.slugs.flatMap((slug) => {
    const s = getService(slug)
    return s ? [{ name: s.navLabel, slug: s.slug }] : []
  }),
}))

export default function ContactPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Contact", path: "/contact" }]}
        eyebrow="0x000000 · open channel"
        title={<>Let&apos;s talk about <span className="text-lime">your project.</span></>}
        intro="Call, WhatsApp or send the details below. Every enquiry reaches our team directly and we reply within one business day."
        actions={
          <>
            <Magnetic>
              <Button asChild size="xl" className="group">
                <a href={site.phone.href}>
                  <Phone data-icon="inline-start" aria-hidden="true" /> {site.phone.display}
                </a>
              </Button>
            </Magnetic>
            <Button asChild size="xl" variant="outline">
              <a href={site.whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageCircle data-icon="inline-start" aria-hidden="true" /> WhatsApp Us
              </a>
            </Button>
          </>
        }
        aside={<ContactTerminal />}
        next="light"
      />

      {/* Channels + form */}
      <Section tone="wash" labelledBy="talk-title">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.4fr] lg:gap-16">
          <aside className="space-y-8">
            <div>
              <Eyebrow className="mb-5">Reach us</Eyebrow>
              <h2 id="talk-title" className="text-3xl leading-tight sm:text-4xl">However Suits You Best</h2>
            </div>
            <ul className="space-y-5">
              {channels.map(({ icon: Icon, label, value, href, note, external }) => (
                <li key={label} className="card-lift flex gap-4 rounded-2xl border border-border bg-card p-5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-lime/10 text-foreground">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">{label}</p>
                    {href ? (
                      <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="link-underline mt-1 block truncate text-[0.95rem] font-semibold">
                        {value}
                      </a>
                    ) : (
                      <p className="mt-1 text-[0.95rem] leading-snug font-semibold">{value}</p>
                    )}
                    {note ? <p className="mt-1 text-sm text-muted-foreground">{note}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
            <div className="dark relative overflow-hidden rounded-2xl bg-background p-6 text-foreground">
              <div aria-hidden="true" className="bg-dots absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
              <p className="font-semibold">Not sure what to ask for yet?</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">Our guided Project Builder turns a rough idea into a scoped brief and an indicative budget in a few minutes.</p>
              <Link href="/project-builder" className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-lime">
                Try the Project Builder <ArrowRight className="arrow-nudge size-4" aria-hidden="true" />
              </Link>
            </div>
          </aside>
          <ContactForm />
        </div>
      </Section>

      {/* What to send us — dark band, so the page has a spine rather than four light sections in a row */}
      <section aria-labelledby="expect-title" className="dark relative isolate overflow-hidden bg-ink-800 text-foreground">
        <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_20%_0%,black,transparent_70%)]" />
        <div className="container-page section-y">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.4fr] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:h-fit">
              <Eyebrow tone="dark" className="mb-5">What to include</Eyebrow>
              <h2 id="expect-title" className="text-3xl leading-tight sm:text-4xl">
                A Good First Message
              </h2>
              <p className="mt-5 leading-relaxed text-white/60">
                You do not need a specification to talk to us. Four things get us to a useful answer faster than anything else.
              </p>
              <Button asChild size="xl" className="mt-8 bg-lime text-ink hover:bg-lime/90">
                <Link href="/project-builder">
                  Or configure it yourself <ArrowRight className="arrow-nudge" data-icon="inline-end" aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <ol className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2">
              {contactExpectations.map((entry, i) => (
                <li key={entry.title} className="bg-ink p-7">
                  <p className="font-mono text-[0.65rem] tracking-[0.14em] text-lime uppercase">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-3 font-heading text-lg text-white">{entry.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-white/60">{entry.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* What happens next */}
      <Section tone="wash" labelledBy="next-title">
        <SectionHeader id="next-title" eyebrow="What happens next" title="From Message to Proposal" align="center" intro="No sales scripts, no auto-responders — a real person reads and answers every enquiry." />
        <ProcessSteps steps={contactNextSteps} />
      </Section>

      {/* Service categories */}
      <Section tone="soft" labelledBy="services-title">
        <SectionHeader
          id="services-title"
          eyebrow="Not sure who to ask for?"
          title="Browse by What You Need"
          action={<Button asChild size="xl" variant="outline"><Link href="/services">All Services</Link></Button>}
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {serviceGroups.map((group) => (
            <div key={group.title} className="card-lift reveal flex flex-col rounded-2xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold">{group.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{group.blurb}</p>
              <ul className="mt-5 space-y-1 border-t border-border pt-4">
                {group.services.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/services/${s.slug}`} className="group flex items-center justify-between gap-2 py-1.5 text-sm font-medium">
                      <span className="link-underline">{s.name}</span>
                      <ArrowUpRight className="arrow-nudge size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section labelledBy="faq-title">
        <SectionHeader id="faq-title" eyebrow="Before you send that" title="Questions People Ask Before Getting in Touch" align="center" />
        <div className="mx-auto max-w-3xl">
          <FaqList faqs={contactFaqs} withSchema={false} />
          <p className="mt-8 text-center text-muted-foreground">
            More questions? See the full <Link href="/faq" className="font-semibold text-primary hover:underline">FAQ</Link>.
          </p>
        </div>
      </Section>

      <CtaSection
        eyebrow="Still deciding?"
        title="See How We Work Before You Reach Out"
        text="Read through our process and typical investment ranges, or explore examples of the kind of problems we solve."
        primary={{ label: "Our Process", href: "/process" }}
        secondary={{ label: "Selected Work", href: "/work" }}
      />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact Cybercina",
          url: `${site.url}/contact`,
          about: { "@type": "Organization", name: site.name, url: site.url, email: site.email, telephone: "+44 20 7046 6615" },
        }}
      />
    </>
  )
}
