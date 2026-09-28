import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"

import { JsonLd } from "@/components/layout/json-ld"
import { site } from "@/content/site"
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo"

import "./globals.css"

const dmSans = localFont({
  src: "../fonts/DMSans-Variable-latin.woff2",
  weight: "100 1000",
  variable: "--font-dm-sans",
  display: "swap",
})

const jetbrainsMono = localFont({
  src: "../fonts/JetBrainsMono-Variable-latin.woff2",
  weight: "100 800",
  variable: "--font-jetbrains-mono",
  display: "swap",
})

// Pixel face is decorative (window titles, 404); 8 KB, so swapping in is cheap.
const silkscreen = localFont({
  src: "../fonts/Silkscreen-Regular-latin.woff2",
  weight: "400",
  variable: "--font-silkscreen",
  display: "swap",
})

const boldonse = localFont({
  src: "../fonts/Boldonse-Regular-latin.woff2",
  weight: "400",
  variable: "--font-boldonse",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Custom Software, AI & Digital Solutions`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_GB",
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: "#000000",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${dmSans.variable} ${boldonse.variable} ${jetbrainsMono.variable} ${silkscreen.variable}`} data-scroll-behavior="smooth">
      <body className="flex min-h-dvh flex-col">
        {children}
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={websiteJsonLd} />
      </body>
    </html>
  )
}
