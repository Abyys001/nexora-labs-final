import { JsonLd } from "@/components/layout/json-ld"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { Faq } from "@/content/services"
import { faqJsonLd } from "@/lib/seo"

export function FaqList({ faqs, withSchema = true }: { faqs: Faq[]; withSchema?: boolean }) {
  return (
    <>
      <Accordion type="single" collapsible className="divide-y divide-border rounded-2xl border border-border bg-card">
        {faqs.map((faq) => (
          <AccordionItem key={faq.question} value={faq.question} className="border-0 px-5 sm:px-7">
            <AccordionTrigger className="py-5 text-left text-base font-semibold hover:no-underline sm:text-[1.05rem]">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="pb-6 text-[0.95rem] leading-relaxed text-muted-foreground">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {withSchema ? <JsonLd data={faqJsonLd(faqs)} /> : null}
    </>
  )
}
