"use client"

import { RotateCcw } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section className="dark flex min-h-[70vh] items-center bg-black text-foreground">
      <div className="container-page py-24 text-center">
        <Image src="/media/pixel-dino.webp" alt="" width={396} height={426} className="mx-auto w-28" />
        <p className="font-pixel mt-8 text-sm text-lime">Something went wrong</p>
        <h1 className="mt-4 text-4xl">We couldn&apos;t load this page</h1>
        <p className="mx-auto mt-5 max-w-md text-lg text-muted-foreground">Please try again. If the problem continues, contact us and we&apos;ll look into it.</p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="xl" onClick={reset}><RotateCcw data-icon="inline-start" /> Try again</Button>
          <Button asChild size="xl" variant="outline"><Link href="/">Back to Home</Link></Button>
        </div>
      </div>
    </section>
  )
}
