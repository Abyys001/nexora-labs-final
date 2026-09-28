import { AlertTriangle } from "lucide-react"

import { PageHero } from "./page-hero"
import { Section } from "./section"

export type LegalSection = { heading: string; paragraphs: string[] }

export function LegalPage({ title, path, updated, intro, sections }: { title: string; path: string; updated: string; intro: string; sections: LegalSection[] }) {
  return (
    <>
      <PageHero crumbs={[{ name: title, path }]} title={title} intro={intro} actions={<p className="text-sm text-white/50">Last updated: {updated}</p>} />
      <Section>
        <div className="mx-auto max-w-3xl">
          <div role="note" className="mb-12 flex items-start gap-3 rounded-xl border border-border bg-soft p-4 text-sm text-foreground/80">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <p>Template document: this text is a starting point and must be reviewed by a qualified legal adviser before publication.</p>
          </div>
          {sections.map((s, i) => (
            <section key={s.heading} aria-labelledby={`legal-${i}`} className="mb-10">
              <h2 id={`legal-${i}`} className="mb-4 text-xl">{i + 1}. {s.heading}</h2>
              {s.paragraphs.map((p) => <p key={p} className="mb-4 leading-relaxed text-foreground/80">{p}</p>)}
            </section>
          ))}
        </div>
      </Section>
    </>
  )
}
