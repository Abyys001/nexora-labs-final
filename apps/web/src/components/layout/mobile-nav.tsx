"use client"

import { ArrowRight, Menu, Phone } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { BrandIcon } from "@/components/icons/brand-icons"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { site } from "@/content/site"
import type { ResolvedNavItem } from "@/lib/navigation"

import { Logo } from "./logo"

export function MobileNav({ items }: { items: ResolvedNavItem[] }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-lg" className="lg:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="dark gap-0 border-border bg-black text-foreground data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle asChild>
            <div onClick={close}>
              <Logo />
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile" className="bg-dots flex-1 overflow-y-auto px-4 py-2">
          <Accordion type="single" collapsible>
            {items.map((item) => {
              if (item.kind === "link") {
                return (
                  <Link key={item.label} href={item.href} onClick={close} className="flex items-center justify-between border-b border-border py-4 text-base font-medium">
                    {item.label}
                    <ArrowRight className="size-4 text-white/40" aria-hidden="true" />
                  </Link>
                )
              }
              return (
                <AccordionItem key={item.label} value={item.label} className="border-border">
                  <AccordionTrigger className="py-4 text-base font-medium hover:no-underline">{item.label}</AccordionTrigger>
                  <AccordionContent className="[&_a]:no-underline">
                    {item.kind === "mega" ? (
                      <div className="space-y-5 pb-3">
                        {item.columns.map((column) => (
                          <div key={column.title}>
                            <p className="mb-2 px-1 font-mono text-[0.68rem] tracking-[0.16em] text-lime uppercase">{column.title}</p>
                            <ul className="grid grid-cols-2 gap-1.5">
                              {column.entries.map((entry) => (
                                <li key={entry.href}>
                                  <Link
                                    href={entry.href}
                                    onClick={close}
                                    className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-ink-800/80 px-2.5 py-2.5 text-[0.8rem] leading-tight text-white/85 [--icon-accent:var(--lime)] active:bg-white/10"
                                  >
                                    <BrandIcon name={entry.icon} className="size-5 shrink-0" />
                                    {entry.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                        <Link href={item.href} onClick={close} className="inline-flex items-center gap-1.5 px-1 text-sm font-semibold text-lime">
                          View all {item.label.toLowerCase()} <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                      </div>
                    ) : (
                      <ul className="grid gap-1 pb-2">
                        {item.links.map((link) => (
                          <li key={link.href}>
                            <Link href={link.href} onClick={close} className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </nav>
        <div className="grid gap-2 border-t border-border bg-black p-4">
          <Button asChild size="xl" onClick={close}>
            <Link href="/project-builder">Start a Project</Link>
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button asChild size="xl" variant="outline">
              <a href={site.phone.href}>
                <Phone data-icon="inline-start" aria-hidden="true" /> Call
              </a>
            </Button>
            <Button asChild size="xl" variant="outline">
              <a href={site.whatsapp} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element -- brand pixel mark */}
                <img src="/media/pixel-whatsapp.webp" alt="" width={18} height={18} className="pixelated size-[18px]" /> WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
