# Nexora Labs — Design Direction

## Product read
A UK software, AI and digital transformation studio selling £2k–£50k+ projects to
business owners and operators. Visitors must leave believing three things: *they
understand my business*, *they are technically serious*, *I know roughly what it costs*.

## Direction: "Phosphor Terminal, tailored"
The brand assets (lime `#BFF747` palette, pixel chat/WhatsApp marks, CRT wire globe,
signal waveform, stacked hex "0x000000" windows video) point to a retro-computing
signal. We keep that signal but dress it in an editorial, premium layout so it reads
as *engineering culture*, not a gaming skin.

- **Ink canvas, lime signal.** Dark sections are true black `#000` with `#1B1B1B`
  surfaces. Lime is the single brand accent; phosphor green `#39FF6A` is used only
  inside "screens" (media, terminal panels, icon accents) — never for UI text.
- **Three typefaces, strict roles.** Boldonse = display headlines only. DM Sans =
  everything readable. JetBrains Mono = terminal labels, data, prices, eyebrows.
  Silkscreen (pixel) = micro-moments only: window titles, 404, loading.
- **Screens as the illustration system.** Hero, AI flow and case studies are built
  from "windows" (title bar `0x…`, close box, scanlines) that host live UI or media.
  Real product mockups over stock art; user media blended with `mix-blend-screen`.
- **Light sections for reading.** Long content lives on white/soft with ink type;
  dark bands carry spectacle. Transitions use rounded overlaps (`rounded-t-[2.5rem]`
  lifting over the previous band), not waves.

## Layout rhythm (home)
1. Hero — split: headline + live "ecosystem" of floating windows (dark)
2. Proof strip — monospace ticker of capabilities (dark → rounded light overlap)
3. Services — bento grid, mixed card behaviours (light)
4. Industries — horizontal selector with detail pane (soft)
5. From Data to Decisions — pinned scroll diagram with the hex-window video (dark)
6. Technology ecosystem — four orbit clusters (dark)
7. Investment spectrum — single horizontal scale (light)
8. Success stories — editorial alternating showcase (light)
9. Process — progress timeline (soft)
10. FAQ + CTA terminal (dark)

No two consecutive sections share a composition.

## Motion
Vocabulary: lift (4–6px), glow (border sweep), reveal (extra line), motion (decor
drift), magnetic CTA, pointer image-shift. CSS transforms/opacity only; JS limited
to IntersectionObserver + pointer position. Every continuous animation stops under
`prefers-reduced-motion` and off-screen; mobile gets the static variants.

## Contact
`info@cybercina.co.uk`, phone `020 7046 6615` (`tel:+442070466615`), WhatsApp
`https://wa.me/442070466615` (mobile floating button).
