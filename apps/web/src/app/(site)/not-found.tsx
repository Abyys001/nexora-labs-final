import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <section className="dark relative isolate flex min-h-[72vh] items-center overflow-hidden bg-black text-foreground">
      <div aria-hidden="true" className="bg-dots absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]" />
      <div aria-hidden="true" className="scanlines absolute inset-0 -z-10" />
      <div className="container-page py-24 text-center">
        <Image src="/media/pixel-file.webp" alt="" width={152} height={176} priority className="pixelated mx-auto w-20" />
        <p className="font-pixel mt-8 text-sm text-lime">error 0x404</p>
        <h1 className="mt-4 text-4xl sm:text-5xl">This page doesn&apos;t exist</h1>
        <p className="mx-auto mt-5 max-w-md text-lg text-muted-foreground">The page may have moved, or the link may be incorrect.</p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="xl"><Link href="/">Back to Home</Link></Button>
          <Button asChild size="xl" variant="outline"><Link href="/services">Explore Services</Link></Button>
        </div>
      </div>
    </section>
  )
}
