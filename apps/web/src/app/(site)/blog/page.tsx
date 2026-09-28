import { BlogIndex } from "@/components/sections/blog-index"
import { CtaSection } from "@/components/sections/cta-section"
import { PageHero } from "@/components/sections/page-hero"
import { Section } from "@/components/sections/section"
import { posts } from "@/content/blog"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Blog: Software, AI & Business Technology Insights",
  description: "Practical guides on custom software, AI, automation, digital transformation, product design and business growth.",
  path: "/blog",
})

export default function BlogPage() {
  return (
    <>
      <PageHero crumbs={[{ name: "Blog", path: "/blog" }]} eyebrow="Blog" title="Insights for Business Leaders" intro="Practical guidance on software, AI and technology decisions, written for decision-makers rather than developers." />
      <Section tone="wash">
        <BlogIndex posts={posts} featured />
      </Section>
      <CtaSection />
    </>
  )
}
