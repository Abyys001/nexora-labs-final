import { Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import Link from "next/link"

import { footerNav, site } from "@/content/site"

import { Logo } from "./logo"

export function SiteFooter() {
  return (
    <footer className="dark relative overflow-hidden border-t border-white/[0.06] bg-black text-foreground">
      <div className="container-page">
        <div className="grid gap-12 py-14 lg:grid-cols-[1.3fr_2fr]">
          <div className="max-w-sm space-y-5">
            <Logo />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {site.tagline} Custom software, AI and digital solutions for businesses ready to grow.
            </p>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 text-lime" aria-hidden="true" />
                <a href={`mailto:${site.email}`} className="hover:text-foreground">{site.email}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 text-lime" aria-hidden="true" />
                <a href={site.phone.href} className="hover:text-foreground">{site.phone.display}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="size-4 text-lime" aria-hidden="true" />
                <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">WhatsApp</a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden="true" />
                <span>{site.location}</span>
              </li>
            </ul>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerNav.map((group) => (
              <div key={group.label}>
                <h2 className="text-sm font-semibold text-foreground">{group.label}</h2>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <p aria-hidden="true" className="font-heading pointer-events-none -mb-[0.18em] bg-gradient-to-b from-white/[0.09] to-transparent bg-clip-text text-center text-[15vw] leading-none text-transparent select-none lg:text-[11rem]">
          cybercina
        </p>

        <div className="flex flex-col gap-3 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>Prices shown on this website are indicative estimates, not fixed quotes.</p>
        </div>
      </div>
    </footer>
  )
}
