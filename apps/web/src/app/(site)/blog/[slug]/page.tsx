import { Info } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { JsonLd } from "@/components/layout/json-ld"
import { BlogCard, formatDate } from "@/components/sections/blog-card"
import { CtaSection } from "@/components/sections/cta-section"
import { PageHero } from "@/components/sections/page-hero"
import { Section, SectionHeader } from "@/components/sections/section"
import { getCategory, getPost, posts, type Block } from "@/content/blog"
import { blogPostingJsonLd, pageMetadata } from "@/lib/seo"
import { cn } from "@/lib/utils"

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

export const dynamicParams = false

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug)
  if (!post) return {}
  return pageMetadata({ title: post.title, description: post.excerpt, path: `/blog/${post.slug}`, type: "article", publishedTime: post.publishedAt })
}

function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case "h2":
      return <h2 key={i} id={slugify(block.text)} className="mt-12 mb-4 scroll-mt-28 text-2xl font-semibold">{block.text}</h2>
    case "p":
      return <p key={i} className="my-5 text-lg leading-[1.8] text-foreground/85">{block.text}</p>
    case "ul":
      return (
        <ul key={i} className="my-6 list-disc space-y-2.5 pl-6 text-lg leading-relaxed text-foreground/85 marker:text-primary">
          {block.items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      )
    case "quote":
      return <blockquote key={i} className="my-10 border-l-4 border-primary pl-6 text-xl leading-relaxed font-medium">{block.text}</blockquote>
  }
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = getPost((await params).slug)
  if (!post) notFound()
  const category = getCategory(post.category)
  const related = posts.filter((p) => p.slug !== post.slug && p.category === post.category).concat(posts.filter((p) => p.slug !== post.slug && p.category !== post.category)).slice(0, 3)
  const path = `/blog/${post.slug}`
  const toc = post.body.filter((b): b is Extract<Block, { type: "h2" }> => b.type === "h2")

  return (
    <>
      <PageHero
        crumbs={[{ name: "Blog", path: "/blog" }, { name: post.title, path }]}
        eyebrow={category?.name}
        title={post.title}
        intro={post.excerpt}
        actions={
          <p className="text-sm text-muted-foreground">
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time> · {post.readingMinutes} min read · Cybercina
          </p>
        }
      />
      <Section>
        <div className={cn("mx-auto max-w-5xl", toc.length > 1 && "lg:grid lg:grid-cols-[200px_1fr] lg:items-start lg:gap-14")}>
          {toc.length > 1 ? (
            <aside className="hidden lg:sticky lg:top-28 lg:block">
              <p className="font-mono text-[0.68rem] tracking-[0.16em] text-muted-foreground uppercase">On this page</p>
              <nav aria-label="Table of contents" className="mt-4 space-y-2.5 border-l border-border pl-4 text-sm">
                {toc.map((h) => (
                  <a key={h.text} href={`#${slugify(h.text)}`} className="block leading-snug text-muted-foreground transition-colors hover:text-foreground">
                    {h.text}
                  </a>
                ))}
              </nav>
            </aside>
          ) : null}
          <article className="max-w-3xl">
            <div role="note" className="mb-10 flex items-start gap-3 rounded-xl border border-border bg-soft p-4 text-sm text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <p>Sample article: illustrative content included with the website launch.</p>
            </div>
            {post.body.map(renderBlock)}
            <div className="mt-14 border-t border-border pt-8">
              <Link href={category ? `/blog/category/${category.slug}` : "/blog"} className="text-sm font-semibold text-primary hover:underline">
                More {category?.name ?? ""} articles →
              </Link>
            </div>
          </article>
        </div>
      </Section>
      <Section tone="soft" labelledBy="related-title">
        <SectionHeader id="related-title" eyebrow="Keep reading" title="Related Articles" />
        <div className="grid gap-6 md:grid-cols-3">
          {related.map((p) => <BlogCard key={p.slug} post={p} />)}
        </div>
      </Section>
      <CtaSection />
      <JsonLd data={blogPostingJsonLd({ title: post.title, excerpt: post.excerpt, path, publishedAt: post.publishedAt })} />
    </>
  )
}
