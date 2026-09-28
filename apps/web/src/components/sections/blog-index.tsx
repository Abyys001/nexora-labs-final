import { FileText } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { blogCategories, type Post } from "@/content/blog"
import { cn } from "@/lib/utils"

import { BlogCard, FeaturedBlogCard } from "./blog-card"

/** When true, the newest post gets a large featured treatment above the grid (only on the unfiltered index). */
export function BlogIndex({ posts, active, featured = false }: { posts: Post[]; active?: string; featured?: boolean }) {
  const chip = "rounded-full border px-4 py-2 text-sm font-medium transition-colors"
  const featuredPost = featured ? posts[0] : undefined
  const gridPosts = featuredPost ? posts.slice(1) : posts

  return (
    <>
      <nav aria-label="Blog categories" className="mb-12 flex flex-wrap gap-2">
        <Link href="/blog" aria-current={!active ? "page" : undefined} className={cn(chip, !active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground")}>
          All
        </Link>
        {blogCategories.map((c) => (
          <Link
            key={c.slug}
            href={`/blog/category/${c.slug}`}
            aria-current={active === c.slug ? "page" : undefined}
            className={cn(chip, active === c.slug ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground")}
          >
            {c.name}
          </Link>
        ))}
      </nav>
      {posts.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-border px-6 py-20 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileText className="size-6" aria-hidden="true" /></span>
          <h2 className="mt-5 text-xl font-semibold">No articles here yet</h2>
          <p className="mt-2 max-w-sm text-muted-foreground">We&apos;re working on articles for this topic. In the meantime, browse everything we&apos;ve published.</p>
          <Button asChild variant="outline" size="xl" className="mt-6"><Link href="/blog">View all articles</Link></Button>
        </div>
      ) : (
        <>
          {featuredPost ? <FeaturedBlogCard post={featuredPost} className="mb-10" /> : null}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {gridPosts.map((post) => <BlogCard key={post.slug} post={post} />)}
          </div>
        </>
      )}
    </>
  )
}
