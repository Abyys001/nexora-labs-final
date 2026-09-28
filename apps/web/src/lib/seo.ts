import type { Metadata } from "next"

import { site } from "@/content/site"
import type { Faq } from "@/content/services"

type PageMeta = {
  title: string
  description: string
  path: string
  type?: "website" | "article"
  publishedTime?: string
  noIndex?: boolean
}

export function pageMetadata({ title, description, path, type = "website", publishedTime, noIndex }: PageMeta): Metadata {
  const url = `${site.url}${path}`
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url,
      siteName: site.name,
      type,
      locale: "en_GB",
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: { card: "summary_large_image", title: `${title} | ${site.name}`, description },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  }
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  logo: `${site.url}/apple-icon`,
  slogan: site.tagline,
  description: site.description,
  email: site.email,
  telephone: "+44 20 7046 6615",
  areaServed: ["GB", "Worldwide"],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+44 20 7046 6615",
    contactType: "customer service",
    email: site.email,
    areaServed: "GB",
    availableLanguage: ["English"],
  },
}

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  url: site.url,
  publisher: { "@type": "Organization", name: site.name },
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${site.url}${item.path}`,
    })),
  }
}

export function faqJsonLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  }
}

export function serviceJsonLd(service: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    url: `${site.url}${service.path}`,
    provider: { "@type": "Organization", name: site.name, url: site.url },
    areaServed: ["GB", "Worldwide"],
  }
}

export function blogPostingJsonLd(post: { title: string; excerpt: string; path: string; publishedAt: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    url: `${site.url}${post.path}`,
    mainEntityOfPage: `${site.url}${post.path}`,
    author: { "@type": "Organization", name: site.name },
    publisher: { "@type": "Organization", name: site.name },
  }
}
