import { Suspense } from "react"

import { JsonLd } from "@/components/layout/json-ld"
import { ProjectBuilder } from "@/components/project-builder/project-builder"
import { PageHero } from "@/components/sections/page-hero"
import { Section } from "@/components/sections/section"
import { Skeleton } from "@/components/ui/skeleton"
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo"
import { getPublicPricing } from "@/lib/server/public-api"

export const metadata = pageMetadata({
  title: "Project Builder — Configure Your Software Project",
  description:
    "Configure your software project step by step: choose what to build, your industry, features, platforms, integrations, AI scope and timeline, and see the estimated investment update live in GBP, EUR or USD.",
  path: "/project-builder",
})

const crumbs = [{ name: "Project Builder", path: "/project-builder" }]

function BuilderFallback() {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_21rem]" aria-busy="true" aria-label="Loading the project builder">
      <div className="grid gap-6">
        <Skeleton className="h-8 w-full rounded-full" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      </div>
      <Skeleton className="hidden h-[520px] rounded-2xl lg:block" />
    </div>
  )
}

export default async function ProjectBuilderPage() {
  const { catalog, currencies, live } = await getPublicPricing()

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, ...crumbs])} />
      <PageHero
        crumbs={crumbs}
        next="dark"
        eyebrow="Project builder"
        title="Build Your Project, Step by Step"
        intro="Choose what you need and watch the scope, the delivery schedule and the estimated investment update as you go. It takes about five minutes, and nothing is committed until you say so."
      />
      <Section tone="dark" className="pb-32 lg:pb-28">
        <Suspense fallback={<BuilderFallback />}>
          <ProjectBuilder catalog={catalog} currencies={currencies} live={live} />
        </Suspense>
      </Section>
    </>
  )
}
