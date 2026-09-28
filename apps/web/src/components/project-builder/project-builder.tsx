"use client"

import type { PricingCatalog, PricingItem, Selection } from "@nexora/pricing"
import { estimate as computeEstimate } from "@nexora/pricing"
import { ArrowLeft, ArrowRight, Check, ChevronUp, Loader2, RotateCcw, Send, Sparkles } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react"

import { submitProjectRequest } from "@/app/actions/project-request"
import { describedBy, Field, NativeSelect, TextArea, TextInput } from "@/components/forms/fields"
import { FormError } from "@/components/forms/form-status"
import { Button } from "@/components/ui/button"
import { builderIndustries, goals as goalOptions, resolveIcon, solutionBrandIcons } from "@/content/project-builder"
import { formatMoney, itemsOfKind, toCurrency as convertAmount, type PublicCurrency } from "@/lib/catalog"
import { companySizeOptions, paymentPreferenceOptions, preferredContactOptions, type CreateProjectRequestInput } from "@/lib/project-request"
import type { RecommendationSelection } from "@/lib/project-estimate"
import { cn } from "@/lib/utils"

import { FeatureStep, type SuggestTarget } from "./feature-step"
import { OptionCard, variantFor } from "./option-card"
import { SummaryBody, SummaryPanel } from "./summary-panel"
import { initialBuilderState, useBuilderState, type BuilderState } from "./use-builder-state"

type StepId =
  | "solution"
  | "industry"
  | "goals"
  | "features"
  | "platforms"
  | "integrations"
  | "ai"
  | "scale"
  | "design"
  | "timeline"
  | "details"
  | "contact"
  | "review"
  | "estimate"

const steps: { id: StepId; label: string; title: string; intro: string }[] = [
  { id: "solution", label: "Build", title: "What do you want to build?", intro: "Choose everything that applies — most projects combine more than one." },
  { id: "industry", label: "Industry", title: "What industry are you in?", intro: "This shapes the features and compliance work we recommend." },
  { id: "goals", label: "Goals", title: "What should this achieve?", intro: "Pick the business outcomes that matter most." },
  { id: "features", label: "Features", title: "Which features do you need?", intro: "Browse by area or search. Each one adds to the estimate on the right." },
  { id: "platforms", label: "Platforms", title: "Where will people use it?", intro: "Every extra platform is a separate build and release." },
  { id: "integrations", label: "Integrations", title: "What should it connect to?", intro: "The systems that already run your business." },
  { id: "ai", label: "AI", title: "Do you need AI capabilities?", intro: "Optional. Skip this step if AI isn't part of the project." },
  { id: "scale", label: "Scale", title: "How many people will use it?", intro: "Scale and technical complexity both affect the engineering effort." },
  { id: "design", label: "Design", title: "What do you need from design?", intro: "From working within your brand to a full design system." },
  { id: "timeline", label: "Timeline", title: "When do you need it?", intro: "A compressed schedule needs dedicated capacity, so it changes the price." },
  { id: "details", label: "Details", title: "Tell us about the project", intro: "Context we can't get from selections alone." },
  { id: "contact", label: "Contact", title: "Who should we reply to?", intro: "We reply to every request within one business day." },
  { id: "review", label: "Review", title: "Review your project", intro: "Check everything below, then send it to our team." },
  { id: "estimate", label: "Estimate", title: "Your estimate", intro: "Choose a currency and tell us how you'd prefer to pay." },
]

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function ProjectBuilder({ catalog, currencies, live }: { catalog: PricingCatalog; currencies: PublicCurrency[]; live: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Deep links from the services and industries pages pre-select the builder.
  const seedSolution = searchParams.get("solution")
  const seedIndustry = searchParams.get("industry")
  const seed = useCallback(
    (s: BuilderState): BuilderState => ({
      ...s,
      solutionTypes: seedSolution && catalog.items.some((i) => i.id === seedSolution && i.kind === "solution") ? [seedSolution] : s.solutionTypes,
      industries: seedIndustry && builderIndustries.some((i) => i.id === seedIndustry) ? [seedIndustry] : s.industries,
    }),
    [seedSolution, seedIndustry, catalog],
  )

  const { state, set, toggle, reset, clear, restored, hydrated } = useBuilderState(seed)
  const step = Math.min(state.step, steps.length - 1)
  const current = steps[step]

  const solutions = useMemo(() => itemsOfKind(catalog, "solution"), [catalog])
  const platforms = useMemo(() => itemsOfKind(catalog, "platform"), [catalog])
  const integrations = useMemo(() => itemsOfKind(catalog, "integration"), [catalog])
  const aiItems = useMemo(() => itemsOfKind(catalog, "ai"), [catalog])
  const designItems = useMemo(() => itemsOfKind(catalog, "design"), [catalog])
  const supportItems = useMemo(() => itemsOfKind(catalog, "support"), [catalog])
  const maintenanceItems = useMemo(() => itemsOfKind(catalog, "maintenance"), [catalog])

  const selection: Selection = useMemo(
    () => ({
      solutionTypes: state.solutionTypes,
      features: state.features,
      platforms: state.platforms,
      integrations: state.integrations,
      ai: state.ai,
      design: state.design,
      support: state.support || undefined,
      maintenance: state.maintenance || undefined,
      complexity: state.complexity,
      timeline: state.timeline,
      userScale: state.userScale || undefined,
    }),
    [state],
  )

  const estimate = useMemo(() => computeEstimate(catalog, selection), [catalog, selection])

  const recommendationSelection: RecommendationSelection = useMemo(
    () => ({
      solutionTypes: state.solutionTypes,
      industries: state.industries,
      goals: state.goals,
      features: state.features,
      integrations: state.integrations,
      ai: state.ai,
      design: state.design,
    }),
    [state],
  )

  const toCurrency = useCallback((gbp: number) => convertAmount(gbp, state.currency, currencies), [state.currency, currencies])

  // Keyboard and screen-reader focus follows the step, not the scroll position.
  useEffect(() => {
    if (!touched) return
    headingRef.current?.focus()
    headingRef.current?.scrollIntoView({ block: "start", behavior: "smooth" })
  }, [step, touched])

  const stepError = validateStep(current.id, state)
  const canAdvance = stepError === null

  function go(delta: number) {
    setTouched(true)
    setError(null)
    if (delta > 0 && stepError) {
      setError(stepError)
      return
    }
    set("step", Math.max(0, Math.min(steps.length - 1, step + delta)))
  }

  function jumpTo(index: number) {
    setTouched(true)
    setError(null)
    set("step", index)
  }

  function addTo(list: SuggestTarget, id: string) {
    toggle(list, id, true)
  }

  function submit() {
    const blocking = steps.map((s) => validateStep(s.id, state)).find((message) => message !== null)
    if (blocking) {
      setError(blocking)
      return
    }
    setError(null)

    const payload: CreateProjectRequestInput = {
      contact: {
        name: state.name.trim(),
        email: state.email.trim(),
        company: state.company.trim() || undefined,
        phone: state.phone.trim() || undefined,
        website: state.website.trim() || undefined,
        companySize: (state.companySize || undefined) as CreateProjectRequestInput["contact"]["companySize"],
        preferredContact: state.preferredContact as "email" | "phone" | "video-call",
      },
      selection,
      details: {
        goals: state.goals,
        industries: state.industries,
        successCriteria: state.successCriteria.trim() || undefined,
        notes: state.notes.trim() || undefined,
        designNotes: state.designNotes.trim() || undefined,
        startDate: state.startDate.trim() || undefined,
        paymentPreference: state.paymentPreference || undefined,
      },
      currency: state.currency as "GBP" | "EUR" | "USD",
    }

    startTransition(async () => {
      const result = await submitProjectRequest(payload)
      if (result.status === "success") {
        clear()
        router.push(`/request/${result.result.accessToken}?new=1`)
        return
      }
      if (result.status === "error") setError(result.message)
    })
  }

  if (!hydrated) {
    return <BuilderSkeleton />
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-10">
      <div className="min-w-0">
        <ProgressRail step={step} onJump={jumpTo} />

        {restored && step > 0 ? (
          <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/60">
            <span>We restored your configuration from earlier in this tab.</span>
            <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 font-medium text-lime hover:underline">
              <RotateCcw className="size-3.5" aria-hidden="true" /> Start again
            </button>
          </p>
        ) : null}

        {!live ? (
          <p className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/60">
            Live pricing is temporarily unavailable, so figures below use our published defaults. Your request is still priced by our team on submission.
          </p>
        ) : null}

        <header className="mt-8">
          <p className="font-mono text-xs tracking-[0.14em] text-lime uppercase">
            Step {step + 1} of {steps.length}
          </p>
          <h2 ref={headingRef} tabIndex={-1} className="mt-2 font-heading text-2xl text-white outline-none sm:text-3xl">
            {current.title}
          </h2>
          <p className="mt-2 max-w-2xl text-white/55">{current.intro}</p>
        </header>

        <div key={current.id} className="pb-reveal mt-7">
          {current.id === "solution" ? (
            <CardGrid
              items={solutions}
              selected={state.solutionTypes}
              onToggle={(id) => toggle("solutionTypes", id)}
              currency={state.currency}
              toCurrency={toCurrency}
              priceLabel="from"
              brandIcons={solutionBrandIcons}
            />
          ) : null}

          {current.id === "industry" ? (
            <ul className="pb-stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {builderIndustries.map((industry, i) => (
                <li key={industry.id} style={{ "--i": i } as React.CSSProperties}>
                  <OptionCard
                    selected={state.industries.includes(industry.id)}
                    onToggle={() => toggle("industries", industry.id)}
                    variant={variantFor(i)}
                    title={industry.label}
                    description={industry.blurb}
                    brandIcon={industry.brandIcon}
                    layout="row"
                  />
                </li>
              ))}
            </ul>
          ) : null}

          {current.id === "goals" ? (
            <ul className="pb-stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {goalOptions.map((goal, i) => (
                <li key={goal.id} style={{ "--i": i } as React.CSSProperties}>
                  <OptionCard
                    selected={state.goals.includes(goal.id)}
                    onToggle={() => toggle("goals", goal.id)}
                    variant={variantFor(i)}
                    title={goal.label}
                    icon={goal.icon}
                    layout="row"
                  />
                </li>
              ))}
            </ul>
          ) : null}

          {current.id === "features" ? (
            <FeatureStep
              catalog={catalog}
              currency={state.currency}
              rate={toCurrency}
              selection={recommendationSelection}
              dismissed={state.dismissed}
              onToggle={(id, on) => toggle("features", id, on)}
              onAdd={addTo}
              onDismiss={(ruleId) => set("dismissed", [...state.dismissed, ruleId])}
            />
          ) : null}

          {current.id === "platforms" ? (
            <CardGrid items={platforms} selected={state.platforms} onToggle={(id) => toggle("platforms", id)} currency={state.currency} toCurrency={toCurrency} />
          ) : null}

          {current.id === "integrations" ? (
            <CardGrid
              items={integrations}
              selected={state.integrations}
              onToggle={(id) => toggle("integrations", id)}
              currency={state.currency}
              toCurrency={toCurrency}
            />
          ) : null}

          {current.id === "ai" ? (
            <CardGrid items={aiItems} selected={state.ai} onToggle={(id) => toggle("ai", id)} currency={state.currency} toCurrency={toCurrency} />
          ) : null}

          {current.id === "scale" ? (
            <div className="grid gap-8">
              <ChoiceRow
                legend="Expected number of users"
                options={catalog.scale.map((s) => ({ id: s.id, label: s.label, description: s.description, badge: multiplierBadge(s.multiplier) }))}
                value={state.userScale}
                onChange={(id) => set("userScale", id)}
              />
              <ChoiceRow
                legend="Technical complexity"
                options={catalog.complexity.map((c) => ({ id: c.id, label: c.label, description: c.description, badge: multiplierBadge(c.multiplier) }))}
                value={state.complexity}
                onChange={(id) => set("complexity", id)}
              />
            </div>
          ) : null}

          {current.id === "design" ? (
            <div className="grid gap-7">
              <CardGrid items={designItems} selected={state.design} onToggle={(id) => toggle("design", id)} currency={state.currency} toCurrency={toCurrency} />
              <Field id="designNotes" label="Design notes" optional hint="Brand guidelines, references, anything the design must respect.">
                <TextArea
                  id="designNotes"
                  value={state.designNotes}
                  onChange={(e) => set("designNotes", e.target.value)}
                  maxLength={2000}
                  className="min-h-28 border-white/10 bg-white/[0.03] text-white placeholder:text-white/35"
                  placeholder="We have brand guidelines and a logo, but no digital design system yet."
                />
              </Field>
            </div>
          ) : null}

          {current.id === "timeline" ? (
            <TimelineStep catalog={catalog} value={state.timeline} onChange={(id) => set("timeline", id)} currency={state.currency} toCurrency={toCurrency} estimate={estimate} />
          ) : null}

          {current.id === "details" ? (
            <div className="grid gap-6">
              <Field id="successCriteria" label="What does success look like?" optional hint="How you'll know the project worked.">
                <TextArea
                  id="successCriteria"
                  value={state.successCriteria}
                  onChange={(e) => set("successCriteria", e.target.value)}
                  maxLength={1000}
                  className="min-h-28 border-white/10 bg-white/[0.03] text-white placeholder:text-white/35"
                  placeholder="Our team stops re-keying orders by hand, and customers can check status themselves."
                />
              </Field>
              <Field id="notes" label="Anything else we should know?" optional hint="Existing systems, constraints, deadlines, budget context.">
                <TextArea
                  id="notes"
                  value={state.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  maxLength={3000}
                  className="min-h-32 border-white/10 bg-white/[0.03] text-white placeholder:text-white/35"
                  placeholder="We currently run on spreadsheets and a legacy Access database."
                />
              </Field>
              <Field id="startDate" label="Preferred start" optional hint="A month is fine — we'll confirm the schedule with you.">
                <TextInput
                  id="startDate"
                  value={state.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                  maxLength={40}
                  className="border-white/10 bg-white/[0.03] text-white placeholder:text-white/35"
                  placeholder="Early next quarter"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <ChoiceRow
                  legend="Ongoing support"
                  columns={1}
                  options={supportItems.map((s) => ({ id: s.id, label: s.label, description: s.blurb, badge: s.price ? `${formatMoney(toCurrency(s.price), state.currency)}/mo` : "Included" }))}
                  value={state.support}
                  onChange={(id) => set("support", id === state.support ? "" : id)}
                />
                <ChoiceRow
                  legend="Ongoing maintenance"
                  columns={1}
                  options={maintenanceItems.map((m) => ({ id: m.id, label: m.label, description: m.blurb, badge: m.price ? `${formatMoney(toCurrency(m.price), state.currency)}/mo` : "Included" }))}
                  value={state.maintenance}
                  onChange={(id) => set("maintenance", id === state.maintenance ? "" : id)}
                />
              </div>
            </div>
          ) : null}

          {current.id === "contact" ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="name" label="Your name" error={touched && !state.name.trim() ? "Please enter your name" : undefined}>
                <TextInput
                  id="name"
                  value={state.name}
                  onChange={(e) => set("name", e.target.value)}
                  autoComplete="name"
                  required
                  aria-describedby={describedBy("name", touched && !state.name.trim() ? "e" : undefined)}
                  className="border-white/10 bg-white/[0.03] text-white placeholder:text-white/35"
                />
              </Field>
              <Field id="email" label="Work email" error={touched && !emailPattern.test(state.email.trim()) ? "Please enter a valid email address" : undefined}>
                <TextInput
                  id="email"
                  type="email"
                  value={state.email}
                  onChange={(e) => set("email", e.target.value)}
                  autoComplete="email"
                  required
                  className="border-white/10 bg-white/[0.03] text-white placeholder:text-white/35"
                />
              </Field>
              <Field id="company" label="Company" optional>
                <TextInput
                  id="company"
                  value={state.company}
                  onChange={(e) => set("company", e.target.value)}
                  autoComplete="organization"
                  className="border-white/10 bg-white/[0.03] text-white placeholder:text-white/35"
                />
              </Field>
              <Field id="phone" label="Phone" optional>
                <TextInput
                  id="phone"
                  type="tel"
                  value={state.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  autoComplete="tel"
                  className="border-white/10 bg-white/[0.03] text-white placeholder:text-white/35"
                />
              </Field>
              <Field id="website" label="Website" optional hint="Include https://">
                <TextInput
                  id="website"
                  type="url"
                  value={state.website}
                  onChange={(e) => set("website", e.target.value)}
                  placeholder="https://"
                  className="border-white/10 bg-white/[0.03] text-white placeholder:text-white/35"
                />
              </Field>
              <Field id="companySize" label="Company size" optional>
                <NativeSelect
                  id="companySize"
                  value={state.companySize}
                  onChange={(e) => set("companySize", e.target.value)}
                  options={companySizeOptions}
                  placeholder="Select a size"
                  className="border-white/10 bg-white/[0.03] text-white"
                />
              </Field>
              <Field id="preferredContact" label="Preferred contact" className="sm:col-span-2">
                <NativeSelect
                  id="preferredContact"
                  value={state.preferredContact}
                  onChange={(e) => set("preferredContact", e.target.value)}
                  options={preferredContactOptions}
                  className="border-white/10 bg-white/[0.03] text-white"
                />
              </Field>
            </div>
          ) : null}

          {current.id === "review" ? <ReviewStep state={state} catalog={catalog} onJump={jumpTo} /> : null}

          {current.id === "estimate" ? (
            <div className="grid gap-8">
              <CurrencyPicker currencies={currencies} value={state.currency} onChange={(code) => set("currency", code)} />
              <ChoiceRow
                legend="How would you prefer to pay?"
                columns={2}
                options={paymentPreferenceOptions.map((p) => ({ id: p.value, label: p.label, description: p.hint }))}
                value={state.paymentPreference}
                onChange={(id) => set("paymentPreference", id)}
              />
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <SummaryBody state={state} catalog={catalog} estimate={estimate} currency={state.currency} toCurrency={toCurrency} compact />
              </div>
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="mt-6">
            <FormError message={error} />
          </div>
        ) : null}

        <nav className="mt-9 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6" aria-label="Builder steps">
          <Button type="button" variant="outline" size="xl" onClick={() => go(-1)} disabled={step === 0 || pending} className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white">
            <ArrowLeft className="size-4" data-icon="inline-start" aria-hidden="true" /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button type="button" size="xl" onClick={() => go(1)} disabled={!canAdvance && touched} className="bg-lime text-ink hover:bg-lime/90">
              Continue <ArrowRight className="size-4 arrow-nudge" data-icon="inline-end" aria-hidden="true" />
            </Button>
          ) : (
            <Button type="button" size="xl" onClick={submit} disabled={pending} className="bg-lime text-ink hover:bg-lime/90">
              {pending ? <Loader2 className="size-4 animate-spin" data-icon="inline-start" aria-hidden="true" /> : <Send className="size-4" data-icon="inline-start" aria-hidden="true" />}
              {pending ? "Sending…" : "Send my project"}
            </Button>
          )}
          {stepError && touched ? <p className="text-sm text-white/50">{stepError}</p> : null}
        </nav>
      </div>

      <SummaryPanel state={state} catalog={catalog} estimate={estimate} currency={state.currency} toCurrency={toCurrency} />

      <MobileSummary
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        total={formatMoney(toCurrency(estimate.total), state.currency)}
        count={state.features.length + state.integrations.length + state.ai.length + state.platforms.length + state.design.length}
      >
        <SummaryBody state={state} catalog={catalog} estimate={estimate} currency={state.currency} toCurrency={toCurrency} />
      </MobileSummary>
    </div>
  )
}

function validateStep(id: StepId, state: BuilderState): string | null {
  if (id === "solution" && state.solutionTypes.length === 0) return "Choose at least one thing you'd like us to build."
  if (id === "contact") {
    if (state.name.trim().length < 2) return "Please enter your name."
    if (!emailPattern.test(state.email.trim())) return "Please enter a valid email address."
    if (state.website.trim() && !/^https?:\/\/\S+$/.test(state.website.trim())) return "Please enter a full website URL, including https://."
  }
  return null
}

const multiplierBadge = (multiplier: number) => (multiplier === 1 ? "No change" : `+${Math.round((multiplier - 1) * 100)}%`)

function ProgressRail({ step, onJump }: { step: number; onJump: (i: number) => void }) {
  return (
    <div className="grid gap-3">
      <ol className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Progress">
        {steps.map((s, i) => {
          const done = i < step
          const active = i === step
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onJump(i)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[0.7rem] tracking-wide whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-lime",
                  active ? "border-lime bg-lime text-ink" : done ? "border-lime/30 text-lime/80 hover:border-lime/60" : "border-white/10 text-white/40 hover:border-white/25 hover:text-white/70",
                )}
              >
                {done ? <Check className="size-3" aria-hidden="true" /> : <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>}
                {s.label}
              </button>
            </li>
          )
        })}
      </ol>
      <div className="h-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
        <div className="h-full rounded-full bg-lime transition-[width] duration-500 ease-out" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>
    </div>
  )
}

function CardGrid({
  items,
  selected,
  onToggle,
  currency,
  toCurrency,
  priceLabel = "+",
  brandIcons,
}: {
  items: PricingItem[]
  selected: string[]
  onToggle: (id: string) => void
  currency: string
  toCurrency: (gbp: number) => number
  priceLabel?: string
  brandIcons?: Record<string, import("@/components/icons/brand-icons").BrandIconName>
}) {
  if (items.length === 0) {
    return <p className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/55">Nothing to choose here right now — continue to the next step.</p>
  }
  return (
    <ul className="pb-stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item, i) => (
        <li key={item.id} style={{ "--i": i } as React.CSSProperties}>
          <OptionCard
            selected={selected.includes(item.id)}
            onToggle={() => onToggle(item.id)}
            variant={variantFor(i)}
            title={item.label}
            description={item.blurb}
            brandIcon={brandIcons?.[item.id]}
            icon={brandIcons?.[item.id] ? undefined : resolveIcon(item.icon)}
          >
            <span className={cn("mt-3 block font-mono text-xs", selected.includes(item.id) ? "text-lime" : "text-white/45")}>
              {item.price > 0 ? `${priceLabel} ${formatMoney(toCurrency(item.price), currency)}` : "Included"}
            </span>
          </OptionCard>
        </li>
      ))}
    </ul>
  )
}

function ChoiceRow({
  legend,
  options,
  value,
  onChange,
  columns = 3,
}: {
  legend: string
  options: { id: string; label: string; description?: string; badge?: string }[]
  value: string
  onChange: (id: string) => void
  columns?: 1 | 2 | 3
}) {
  return (
    <fieldset>
      <legend className="font-mono text-xs font-semibold tracking-[0.1em] text-white/70 uppercase">{legend}</legend>
      <ul className={cn("pb-stagger mt-3 grid gap-3", columns === 1 ? "" : columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3")}>
        {options.map((option, i) => {
          const selected = option.id === value
          return (
            <li key={option.id} style={{ "--i": i } as React.CSSProperties}>
              <button
                type="button"
                aria-pressed={selected}
                data-variant={variantFor(i)}
                data-selected={selected}
                onClick={() => onChange(option.id)}
                className={cn(
                  "pb-card group flex w-full flex-col gap-1.5 rounded-2xl border p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-lime",
                  selected ? "border-lime/70 bg-lime/[0.07]" : "border-white/10 bg-ink-800 hover:border-white/25",
                )}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-white">{option.label}</span>
                  {option.badge ? (
                    <span className={cn("shrink-0 rounded-full px-2 py-0.5 font-mono text-[0.65rem]", selected ? "bg-lime text-ink" : "bg-white/10 text-white/60")}>{option.badge}</span>
                  ) : null}
                </span>
                {option.description ? <span className="text-sm leading-snug text-white/55">{option.description}</span> : null}
              </button>
            </li>
          )
        })}
      </ul>
    </fieldset>
  )
}

function TimelineStep({
  catalog,
  value,
  onChange,
  currency,
  toCurrency,
  estimate,
}: {
  catalog: PricingCatalog
  value: string
  onChange: (id: string) => void
  currency: string
  toCurrency: (gbp: number) => number
  estimate: ReturnType<typeof computeEstimate>
}) {
  const adjustment = estimate.adjustments.find((a) => a.key === "timeline")
  const base = estimate.total - (adjustment?.amount ?? 0)

  return (
    <div className="grid gap-7">
      <ul className="pb-stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[...catalog.timelines].sort((a, b) => a.sort - b.sort).map((timeline, i) => {
          const selected = timeline.id === value
          const uplift = Math.round((timeline.multiplier - 1) * 100)
          return (
            <li key={timeline.id} style={{ "--i": i } as React.CSSProperties}>
              <button
                type="button"
                aria-pressed={selected}
                data-variant={variantFor(i)}
                data-selected={selected}
                onClick={() => onChange(timeline.id)}
                className={cn(
                  "pb-card group flex h-full w-full flex-col gap-2 rounded-2xl border p-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-lime",
                  selected ? "border-lime/70 bg-lime/[0.07]" : "border-white/10 bg-ink-800 hover:border-white/25",
                )}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-white">{timeline.label}</span>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 font-mono text-[0.65rem]", uplift === 0 ? "bg-white/10 text-white/60" : selected ? "bg-lime text-ink" : "bg-lime/15 text-lime")}>
                    {uplift === 0 ? "Standard rate" : `+${uplift}%`}
                  </span>
                </span>
                <span className="text-sm leading-snug text-white/55">{timeline.description}</span>
                <span className="mt-auto pt-2 font-mono text-[0.7rem] text-white/35">≈ {timeline.weeks} weeks</span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="rounded-2xl border border-lime/25 bg-lime/[0.04] p-5">
        <p className="flex items-center gap-2 font-mono text-[0.7rem] tracking-[0.14em] text-lime uppercase">
          <Sparkles className="size-3.5" aria-hidden="true" /> Timeline adjustment
        </p>
        <dl className="mt-3 grid gap-2 font-mono text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-white/55">Base project</dt>
            <dd className="text-white/85">{formatMoney(toCurrency(base), currency)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-white/55">{adjustment?.label ?? "Standard delivery"}</dt>
            <dd className={cn(adjustment && adjustment.amount !== 0 ? "text-lime" : "text-white/50")}>
              {adjustment && adjustment.amount !== 0 ? `+ ${formatMoney(toCurrency(adjustment.amount), currency)}` : "No adjustment"}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-t border-white/10 pt-2">
            <dt className="font-semibold text-white">Estimated investment</dt>
            <dd className="font-semibold text-lime">{formatMoney(toCurrency(estimate.total), currency)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-[0.72rem] leading-relaxed text-white/45">
          {adjustment && adjustment.amount !== 0
            ? adjustment.reason
            : "Standard and flexible schedules carry no uplift — we plan them into normal delivery capacity."}
        </p>
      </div>
    </div>
  )
}

function CurrencyPicker({ currencies, value, onChange }: { currencies: PublicCurrency[]; value: string; onChange: (code: string) => void }) {
  const list = currencies.length ? currencies : [{ code: "GBP", rate: 1, rounding: "none" as const, rateUpdatedAt: "" }]
  return (
    <fieldset>
      <legend className="font-mono text-xs font-semibold tracking-[0.1em] text-white/70 uppercase">Show prices in</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {list.map((currency) => {
          const selected = currency.code === value
          return (
            <button
              key={currency.code}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(currency.code)}
              className={cn(
                "rounded-full border px-4 py-2 font-mono text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-lime",
                selected ? "border-lime bg-lime text-ink" : "border-white/10 text-white/70 hover:border-white/30 hover:text-white",
              )}
            >
              {currency.code}
            </button>
          )
        })}
      </div>
      <p className="mt-2.5 text-[0.72rem] text-white/40">
        We quote and invoice in GBP. Other currencies are converted at the rate recorded on your request, so a later rate change never alters your proposal.
      </p>
    </fieldset>
  )
}

function ReviewStep({ state, catalog, onJump }: { state: BuilderState; catalog: PricingCatalog; onJump: (i: number) => void }) {
  const labels = useMemo(() => new Map(catalog.items.map((i) => [i.id, i.label])), [catalog])
  const rows: { step: number; label: string; value: string }[] = [
    { step: 0, label: "Building", value: state.solutionTypes.map((id) => labels.get(id) ?? id).join(", ") || "—" },
    { step: 1, label: "Industry", value: state.industries.map((id) => builderIndustries.find((x) => x.id === id)?.label ?? id).join(", ") || "—" },
    { step: 2, label: "Goals", value: state.goals.map((id) => goalOptions.find((x) => x.id === id)?.label ?? id).join(", ") || "—" },
    { step: 3, label: "Features", value: state.features.length ? `${state.features.length} selected` : "None yet" },
    { step: 4, label: "Platforms", value: state.platforms.map((id) => labels.get(id) ?? id).join(", ") || "—" },
    { step: 5, label: "Integrations", value: state.integrations.map((id) => labels.get(id) ?? id).join(", ") || "None" },
    { step: 6, label: "AI", value: state.ai.map((id) => labels.get(id) ?? id).join(", ") || "None" },
    { step: 7, label: "Scale", value: catalog.scale.find((s) => s.id === state.userScale)?.label ?? "Not specified" },
    { step: 7, label: "Complexity", value: catalog.complexity.find((c) => c.id === state.complexity)?.label ?? "—" },
    { step: 8, label: "Design", value: state.design.map((id) => labels.get(id) ?? id).join(", ") || "None" },
    { step: 9, label: "Timeline", value: catalog.timelines.find((t) => t.id === state.timeline)?.label ?? "—" },
    { step: 10, label: "Preferred start", value: state.startDate || "Not specified" },
    { step: 11, label: "Contact", value: [state.name, state.email, state.company].filter(Boolean).join(" · ") || "—" },
  ]

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <dl className="divide-y divide-white/10">
        {rows.map((row, i) => (
          <div key={`${row.label}-${i}`} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:items-baseline sm:gap-4">
            <dt className="font-mono text-[0.7rem] tracking-[0.1em] text-white/40 uppercase">{row.label}</dt>
            <dd className="text-sm text-white/85">{row.value}</dd>
            <button type="button" onClick={() => onJump(row.step)} className="justify-self-start text-xs font-medium text-lime hover:underline sm:justify-self-end">
              Edit
            </button>
          </div>
        ))}
      </dl>
    </div>
  )
}

function MobileSummary({
  open,
  onOpenChange,
  total,
  count,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  total: string
  count: number
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
      {open ? (
        <div className="max-h-[60vh] overflow-hidden border-t border-white/10 bg-ink-800/95 backdrop-blur">
          <div className="pb-scroll max-h-[calc(60vh-3.5rem)] overflow-y-auto p-5">{children}</div>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 border-t border-white/10 bg-ink px-5 py-3.5 text-left"
      >
        <span>
          <span className="block font-mono text-[0.65rem] tracking-[0.12em] text-white/45 uppercase">Estimated investment</span>
          <span className="font-heading text-lg text-lime">{total}</span>
        </span>
        <span className="flex items-center gap-2 font-mono text-xs text-white/55">
          {count} selected
          <ChevronUp className={cn("size-4 transition-transform", open && "rotate-180")} aria-hidden="true" />
        </span>
      </button>
    </div>
  )
}

function BuilderSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-10" aria-busy="true" aria-label="Loading the project builder">
      <div className="min-w-0 space-y-6">
        <div className="h-8 w-full animate-pulse rounded-full bg-white/[0.06]" />
        <div className="h-10 w-2/3 animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
      </div>
      <div className="hidden h-96 animate-pulse rounded-2xl bg-white/[0.04] lg:block" />
    </div>
  )
}

export { initialBuilderState }
