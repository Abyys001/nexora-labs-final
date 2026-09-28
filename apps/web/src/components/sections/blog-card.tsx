import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { getCategory, type Post } from "@/content/blog"
import { cn } from "@/lib/utils"

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso))
}

/** Large editorial card for the newest post, shown above the regular grid on the unfiltered blog index. */
export function FeaturedBlogCard({ post, className }: { post: Post; className?: string }) {
  return (
    <article className={cn("card-lift reveal group dark relative isolate flex flex-col overflow-hidden rounded-3xl bg-black text-foreground lg:flex-row lg:items-stretch", className)}>
      <div aria-hidden="true" className="bg-dots absolute inset-0 -z-10 opacity-70" />
      <div aria-hidden="true" className="absolute -top-24 -right-24 -z-10 h-72 w-72 rounded-full bg-lime/[0.16] blur-[110px]" />
      <div className="flex flex-1 flex-col justify-center p-8 sm:p-10 lg:p-12">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-mono text-[0.68rem] tracking-[0.16em] text-lime uppercase">Latest article</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-[0.68rem] tracking-wide text-white/70 uppercase">{getCategory(post.category)?.name}</span>
          <span className="text-white/45">Sample article</span>
        </div>
        <h2 className="mt-5 text-2xl leading-snug sm:text-3xl">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h2>
        <p className="mt-4 max-w-xl leading-relaxed text-white/65">{post.excerpt}</p>
        <div className="mt-8 flex items-center gap-4 text-sm text-white/50">
          <span><time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time> · {post.readingMinutes} min read</span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-lime">
            Read article <ArrowRight className="arrow-nudge size-4" aria-hidden="true" />
          </span>
        </div>
      </div>
    </article>
  )
}

export function BlogCard({ post }: { post: Post }) {
  return (
    <article className="card-lift reveal group relative flex h-full flex-col rounded-2xl border border-border bg-card p-7">
      <div className="flex items-center gap-3 text-xs">
        <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[0.68rem] tracking-wide text-primary uppercase">{getCategory(post.category)?.name}</span>
        <span className="text-muted-foreground">Sample article</span>
      </div>
      <h3 className="mt-5 text-xl leading-snug">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 group-hover:text-primary">
          {post.title}
        </Link>
      </h3>
      <p className="mt-3 leading-relaxed text-muted-foreground">{post.excerpt}</p>
      <p className="mt-auto pt-6 text-sm text-muted-foreground">
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time> · {post.readingMinutes} min read
      </p>
    </article>
  )
}
