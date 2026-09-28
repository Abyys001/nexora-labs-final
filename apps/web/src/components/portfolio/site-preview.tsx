import { displayDomain, previewThemes, type PreviewLayout, type PreviewTheme } from "@/lib/projects"
import { cn } from "@/lib/utils"

/**
 * An original, abstract rendering of a project's page structure inside a
 * browser frame. Deliberately not a screenshot: it communicates the shape of
 * the real site — its navigation, hero and the layout that does the work —
 * without reproducing anyone's copyrighted artwork or photography.
 */
export function SitePreview({
  layout,
  theme,
  websiteUrl,
  label,
  className,
}: {
  layout: PreviewLayout
  theme: PreviewTheme
  websiteUrl: string | null
  label: string
  className?: string
}) {
  const { accent, soft } = previewThemes[theme]

  return (
    <figure
      className={cn("window relative overflow-hidden", className)}
      style={{ "--preview-accent": accent, "--preview-soft": soft } as React.CSSProperties}
    >
      <figcaption className="sr-only">Representative layout of the {label} website</figcaption>

      <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.04] px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-white/20" />
          <span className="size-2 rounded-full bg-white/20" />
          <span className="size-2 rounded-full bg-white/20" />
        </span>
        <span className="flex-1 truncate rounded-md bg-black/40 px-2.5 py-1 font-mono text-[0.6rem] text-white/45">{displayDomain(websiteUrl)}</span>
      </div>

      {/* The inner canvas shifts up slightly on hover, as if the page were scrolled. */}
      <div className="relative aspect-16/11 overflow-hidden bg-ink">
        <div className="site-preview-canvas absolute inset-x-0 top-0 p-4 sm:p-5">
          <PreviewNav />
          <PreviewBody layout={layout} />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-ink to-transparent" />
      </div>
    </figure>
  )
}

function PreviewNav() {
  return (
    <div aria-hidden="true" className="flex items-center justify-between gap-3">
      <span className="h-2.5 w-14 rounded-full" style={{ background: "var(--preview-accent)" }} />
      <span className="flex gap-2">
        {[10, 8, 9, 7].map((w, i) => (
          <span key={i} className="h-1.5 rounded-full bg-white/22" style={{ width: `${w * 2}px` }} />
        ))}
      </span>
      <span className="h-4 w-12 rounded-full" style={{ background: "var(--preview-soft)" }} />
    </div>
  )
}

function PreviewBody({ layout }: { layout: PreviewLayout }) {
  return (
    <div aria-hidden="true" className="mt-4 grid gap-3">
      <Hero />
      {layout === "hospitality" ? <HospitalityBody /> : null}
      {layout === "commerce" ? <CommerceBody /> : null}
      {layout === "services" ? <ServicesBody /> : null}
      {layout === "booking" ? <BookingBody /> : null}
      {layout === "standard" ? <StandardBody /> : null}
    </div>
  )
}

function Hero() {
  return (
    <div className="relative overflow-hidden rounded-lg border border-white/8 p-4" style={{ background: "var(--preview-soft)" }}>
      <span className="block h-3 w-3/5 rounded-full bg-white/70" />
      <span className="mt-2 block h-3 w-2/5 rounded-full bg-white/45" />
      <span className="mt-3 block h-1.5 w-4/5 rounded-full bg-white/18" />
      <span className="mt-1.5 block h-1.5 w-3/5 rounded-full bg-white/14" />
      <span className="mt-3 block h-5 w-20 rounded-full" style={{ background: "var(--preview-accent)" }} />
    </div>
  )
}

function Block({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <span className={cn("block rounded-md border border-white/8 bg-white/[0.05]", className)} style={style} />
}

function HospitalityBody() {
  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <Block key={i} className="h-12" style={i === 1 ? { background: "var(--preview-soft)" } : undefined} />
        ))}
      </div>
      <div className="grid gap-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="flex items-center justify-between gap-3 rounded-md border border-white/8 bg-white/[0.03] px-2.5 py-2">
            <span className="h-1.5 flex-1 rounded-full bg-white/20" style={{ maxWidth: `${70 - i * 12}%` }} />
            <span className="h-1.5 w-8 rounded-full" style={{ background: "var(--preview-accent)" }} />
          </span>
        ))}
      </div>
    </>
  )
}

function CommerceBody() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {Array.from({ length: 8 }, (_, i) => (
        <span key={i} className="grid gap-1.5 rounded-md border border-white/8 bg-white/[0.04] p-1.5">
          <span className="block h-8 rounded" style={{ background: i % 3 === 0 ? "var(--preview-soft)" : "rgb(255 255 255 / 0.06)" }} />
          <span className="block h-1 w-3/4 rounded-full bg-white/22" />
          <span className="block h-1 w-1/2 rounded-full" style={{ background: "var(--preview-accent)" }} />
        </span>
      ))}
    </div>
  )
}

function ServicesBody() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} className="grid gap-1.5 rounded-md border border-white/8 bg-white/[0.04] p-2">
          <span className="block size-4 rounded" style={{ background: "var(--preview-accent)", opacity: 0.8 }} />
          <span className="block h-1.5 w-4/5 rounded-full bg-white/25" />
          <span className="block h-1 w-full rounded-full bg-white/12" />
          <span className="block h-1 w-2/3 rounded-full bg-white/12" />
        </span>
      ))}
    </div>
  )
}

function BookingBody() {
  return (
    <>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="flex flex-1 items-center gap-1.5">
            <span className="size-3 shrink-0 rounded-full" style={{ background: i < 2 ? "var(--preview-accent)" : "rgb(255 255 255 / 0.14)" }} />
            {i < 5 ? <span className="h-px flex-1" style={{ background: i < 1 ? "var(--preview-accent)" : "rgb(255 255 255 / 0.12)" }} /> : null}
          </span>
        ))}
      </div>
      <div className="grid gap-2 rounded-lg border border-white/8 bg-white/[0.03] p-3">
        <span className="block h-1.5 w-1/3 rounded-full bg-white/25" />
        <Block className="h-6" />
        <div className="grid grid-cols-2 gap-2">
          <Block className="h-6" />
          <Block className="h-6" />
        </div>
        <span className="mt-1 block h-5 w-24 rounded-full" style={{ background: "var(--preview-accent)" }} />
      </div>
    </>
  )
}

function StandardBody() {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Block className="h-14" />
        <Block className="h-14" style={{ background: "var(--preview-soft)" }} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <Block key={i} className="h-8" />
        ))}
      </div>
    </>
  )
}
