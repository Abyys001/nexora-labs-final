import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { BlogIndex } from "@/components/sections/blog-index"
import { PageHero } from "@/components/sections/page-hero"
import { Section } from "@/components/sections/section"
import { blogCategories, getCategory, posts } from "@/content/blog"
import { pageMetadata } from "@/lib/seo"

export const dynamicParams = false

export function generateStaticParams() {
  return blogCategories.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({ params }: PageProps<"/blog/category/[category]">): Promise<Metadata> {
  const category = getCategory((await params).category)
  if (!category) return {}
  return pageMetadata({ title: `${category.name} Articles`, description: `Articles and guides about ${category.name.toLowerCase()} for business leaders.`, path: `/blog/category/${category.slug}` })
}

export default async function BlogCategoryPage({ params }: PageProps<"/blog/category/[category]">) {
  const category = getCategory((await params).category)
  if (!category) notFound()
  return (
    <>
      <PageHero
        crumbs={[{ name: "Blog", path: "/blog" }, { name: category.name, path: `/blog/category/${category.slug}` }]}
        eyebrow="Blog"
        title={category.name}
        intro={`Articles and guides about ${category.name.toLowerCase()} for business leaders.`}
      />
      <Section>
        <BlogIndex posts={posts.filter((p) => p.category === category.slug)} active={category.slug} />
      </Section>
    </>
  )
}
