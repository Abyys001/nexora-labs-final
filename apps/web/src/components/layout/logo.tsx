import Image from "next/image"
import Link from "next/link"

import { site } from "@/content/site"
import { cn } from "@/lib/utils"

import logo from "../../../public/brand/cybercina-logo.png"
import mark from "../../../public/brand/cybercina-mark.png"

export function LogoMark({ className }: { className?: string }) {
  return <Image src={mark} alt="" aria-hidden="true" className={cn("size-8 object-contain", className)} />
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center rounded-lg", className)} aria-label={`${site.name} home`}>
      <Image src={logo} alt={site.name} priority className="h-11 w-auto transition-transform duration-500 ease-out group-hover:scale-[1.03] lg:h-12" />
    </Link>
  )
}
