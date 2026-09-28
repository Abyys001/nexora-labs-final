"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { site } from "@/content/site"
import { cn } from "@/lib/utils"

// Pages that already are the conversation, or that have their own fixed bottom bar.
const HIDDEN_ON = ["/contact", "/project-builder"]
const HIDDEN_PREFIXES = ["/request/"]

/** Appears once the visitor scrolls past the hero; hidden where the page already is the contact path. */
export function FloatingContact() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const nearBottom = window.innerHeight + window.scrollY > document.documentElement.scrollHeight - 480
        setVisible(window.scrollY > window.innerHeight * 0.8 && !nearBottom)
      })
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", update)
    }
  }, [])

  if (HIDDEN_ON.includes(pathname) || HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null

  const state = visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"

  return (
    <>
      {/* Mobile: WhatsApp is the fastest route to a conversation. */}
      <a
        href={site.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message Nexora Labs on WhatsApp"
        tabIndex={visible ? 0 : -1}
        className={cn(
          "fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex size-14 items-center justify-center rounded-2xl border border-white/15 bg-black shadow-[0_12px_32px_-8px_rgb(57_255_106/0.45)] transition-all duration-500 ease-out active:scale-95 md:hidden",
          state,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- brand pixel mark */}
        <img src="/media/pixel-whatsapp.webp" alt="" width={34} height={34} className="pixelated size-[34px]" />
      </a>

      {/* Desktop: quiet pill toward the project brief. */}
      <Link
        href="/project-builder"
        tabIndex={visible ? 0 : -1}
        className={cn(
          "dark group fixed right-6 bottom-6 z-40 hidden items-center gap-3 rounded-full border border-white/15 bg-black/90 py-2 pr-5 pl-2 text-sm font-semibold text-white shadow-2xl shadow-black/50 backdrop-blur-md transition-all duration-500 ease-out hover:border-lime/50 md:flex",
          state,
        )}
      >
        <span className="relative flex size-9 items-center justify-center rounded-full bg-ink-800">
          {/* eslint-disable-next-line @next/next/no-img-element -- brand pixel mark */}
          <img src="/media/pixel-chat.webp" alt="" width={22} height={20} className="pixelated w-[22px]" />
          <span aria-hidden="true" className="absolute top-1 right-1 size-2 rounded-full bg-lime ring-2 ring-black" />
        </span>
        Let&apos;s talk about your project
        <ArrowRight className="arrow-nudge size-4 text-lime" aria-hidden="true" />
      </Link>
    </>
  )
}
