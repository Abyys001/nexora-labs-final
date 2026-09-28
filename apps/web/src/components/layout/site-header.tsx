import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { resolveHeaderNav } from "@/lib/navigation"

import { DesktopNav, HeaderPhone } from "./desktop-nav"
import { Logo } from "./logo"
import { MobileNav } from "./mobile-nav"

export function SiteHeader() {
  const items = resolveHeaderNav()
  return (
    <header className="dark sticky top-0 z-50 border-b border-white/[0.07] bg-black/80 text-foreground backdrop-blur-xl backdrop-saturate-150">
      <a href="#main" className="sr-only rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50">
        Skip to content
      </a>
      <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-[68px]">
        <Logo />
        <DesktopNav items={items} />
        <div className="flex items-center gap-1.5">
          <HeaderPhone />
          <Button asChild size="lg" className="group hidden h-10 rounded-lg px-4 font-semibold sm:inline-flex">
            <Link href="/project-builder">
              Start a Project <ArrowRight className="arrow-nudge" data-icon="inline-end" aria-hidden="true" />
            </Link>
          </Button>
          <MobileNav items={items} />
        </div>
      </div>
    </header>
  )
}
