"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Save, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useCan } from "./admin-context"
import {
  createPricingItem,
  fetchPricingCatalog,
  fetchPricingSettings,
  pricingKeys,
  updatePricingItem,
  updatePricingMultiplier,
  updatePricingSettings,
  type PricingItemRow,
  type PricingMultiplierRow,
} from "./api"
import { EmptyState, ErrorBlock, gbp, LoadingBlock, PageHeader, Panel, Pill, SavingButton, TableScroll } from "./ui"

const kinds = ["solution", "feature", "platform", "integration", "ai", "design", "support", "maintenance"] as const
type Kind = (typeof kinds)[number]

const kindLabels: Record<Kind, string> = {
  solution: "Solutions",
  feature: "Features",
  platform: "Platforms",
  integration: "Integrations",
  ai: "AI",
  design: "Design",
  support: "Support",
  maintenance: "Maintenance",
}

const groupLabels: Record<PricingMultiplierRow["group"], { title: string; description: string }> = {
  complexity: { title: "Complexity multipliers", description: "Applied to the subtotal before scale and timeline." },
  timeline: { title: "Timeline multipliers", description: "A compressed schedule costs more — these are the uplifts customers see explained in the builder." },
  scale: { title: "Scale multipliers", description: "Expected user volume, applied after complexity." },
}

/**
 * The full pricing catalogue, editable without a deploy. Every figure the
 * estimate engine uses lives here: item prices, multipliers and the global
 * settings (rounding, range and the additional-solution factor).
 */
export function PricingManager() {
  const canEdit = useCan("manager")
  const catalogQuery = useQuery({ queryKey: pricingKeys.catalog, queryFn: fetchPricingCatalog })
  const settingsQuery = useQuery({ queryKey: pricingKeys.settings, queryFn: fetchPricingSettings })

  if (catalogQuery.isPending || settingsQuery.isPending) {
    return (
      <>
        <PageHeader title="Pricing" description="Item prices, multipliers and estimate settings." />
        <LoadingBlock label="Loading the pricing catalogue" rows={5} />
      </>
    )
  }
  if (catalogQuery.isError) {
    return (
      <>
        <PageHeader title="Pricing" />
        <ErrorBlock error={catalogQuery.error} onRetry={() => catalogQuery.refetch()} />
      </>
    )
  }

  const catalog = catalogQuery.data.catalog

  return (
    <>
      <PageHeader
        title="Pricing"
        description="The single source of truth for every automated estimate. Changes take effect on the next catalogue fetch — no deploy required."
        action={<Pill tone="accent">Catalogue {catalog.version.slice(0, 10)}</Pill>}
      />

      <Tabs defaultValue="items">
        <TabsList className="mb-6">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="multipliers">Multipliers</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <ItemsTab canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="multipliers">
          <MultipliersTab canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="settings">
          {settingsQuery.isError ? (
            <ErrorBlock error={settingsQuery.error} onRetry={() => settingsQuery.refetch()} />
          ) : (
            <SettingsTab canEdit={canEdit} settings={settingsQuery.data} />
          )}
        </TabsContent>
      </Tabs>
    </>
  )
}

// The admin catalogue endpoint returns the composed catalogue, which carries the
// business id but not the row uuid needed to address updates. The rows come from
// the same endpoint's underlying table via `/pricing/items`, so items are keyed
// by their catalogue id here and resolved to a row before saving.
function useItemRows() {
  return useQuery({
    queryKey: ["pricing", "items"] as const,
    queryFn: async () => {
      const res = await fetch("/api/admin/pricing/items")
      if (!res.ok) throw new Error("Couldn't load pricing items")
      return (await res.json()) as PricingItemRow[]
    },
  })
}

function ItemsTab({ canEdit }: { canEdit: boolean }) {
  const queryClient = useQueryClient()
  const rows = useItemRows()
  const [kind, setKind] = useState<Kind>("feature")
  const [query, setQuery] = useState("")
  const [adding, setAdding] = useState(false)

  const save = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<PricingItemRow> }) => updatePricingItem(id, patch),
    onSuccess: () => {
      toast.success("Price updated")
      void queryClient.invalidateQueries({ queryKey: ["pricing"] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (rows.data ?? [])
      .filter((row) => row.kind === kind)
      .filter((row) => !q || `${row.label} ${row.itemId}`.toLowerCase().includes(q))
      .sort((a, b) => a.sort - b.sort)
  }, [rows.data, kind, query])

  if (rows.isPending) return <LoadingBlock label="Loading items" rows={4} />
  if (rows.isError) return <ErrorBlock error={rows.error} onRetry={() => rows.refetch()} />

  return (
    <Panel
      title="Catalogue items"
      description="Base prices in whole GBP. The estimate engine multiplies these by the complexity, scale and timeline factors."
      action={
        canEdit ? (
          <Button size="lg" variant="outline" onClick={() => setAdding((open) => !open)}>
            <Plus data-icon="inline-start" /> {adding ? "Cancel" : "New item"}
          </Button>
        ) : null
      }
    >
      {adding ? <NewItemForm onDone={() => setAdding(false)} /> : null}

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {kinds.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              aria-pressed={k === kind}
              className={
                k === kind
                  ? "rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground"
                  : "rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }
            >
              {kindLabels[k]}
            </button>
          ))}
        </div>
        <label className="relative ml-auto block w-full sm:w-56">
          <span className="sr-only">Search items</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="pl-9" />
        </label>
      </div>

      {visible.length === 0 ? (
        <EmptyState title="No items here" description="Try another category, or clear the search." />
      ) : (
        <TableScroll>
          <table className="w-full min-w-[46rem] text-sm">
            <thead>
              <tr className="border-b border-border text-left font-mono text-[0.65rem] tracking-[0.1em] text-muted-foreground uppercase">
                <th className="py-2 pr-4 font-medium">Item</th>
                <th className="py-2 pr-4 font-medium">Category</th>
                <th className="py-2 pr-4 font-medium">Complexity</th>
                <th className="py-2 pr-4 font-medium">Price (GBP)</th>
                <th className="py-2 pr-4 font-medium">Active</th>
                <th className="py-2 font-medium sr-only">Save</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <ItemRow key={row.id} row={row} canEdit={canEdit} onSave={(patch) => save.mutate({ id: row.id, patch })} saving={save.isPending} />
              ))}
            </tbody>
          </table>
        </TableScroll>
      )}
    </Panel>
  )
}

function ItemRow({ row, canEdit, onSave, saving }: { row: PricingItemRow; canEdit: boolean; onSave: (patch: Partial<PricingItemRow>) => void; saving: boolean }) {
  const [price, setPrice] = useState(String(row.price))
  const [active, setActive] = useState(row.active)
  const dirty = price !== String(row.price) || active !== row.active
  const parsed = Number(price)
  const valid = Number.isInteger(parsed) && parsed >= 0

  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="py-3 pr-4">
        <span className="font-medium">{row.label}</span>
        <span className="block font-mono text-[0.7rem] text-muted-foreground">{row.itemId}</span>
      </td>
      <td className="py-3 pr-4 text-xs text-muted-foreground">{row.categoryId}</td>
      <td className="py-3 pr-4 font-mono text-xs uppercase">{row.complexity}</td>
      <td className="py-3 pr-4">
        <Input
          type="number"
          min={0}
          step={50}
          value={price}
          disabled={!canEdit}
          aria-label={`Price for ${row.label}`}
          aria-invalid={!valid}
          onChange={(e) => setPrice(e.target.value)}
          className="h-9 w-28"
        />
        {!valid ? <span className="mt-1 block text-[0.7rem] text-destructive">Whole pounds only</span> : null}
      </td>
      <td className="py-3 pr-4">
        <Switch checked={active} disabled={!canEdit} onCheckedChange={setActive} aria-label={`${row.label} active`} />
      </td>
      <td className="py-3">
        <SavingButton
          pending={saving}
          size="sm"
          variant="outline"
          disabled={!canEdit || !dirty || !valid}
          onClick={() => onSave({ price: parsed, active })}
          aria-label={`Save ${row.label}`}
        >
          <Save data-icon="inline-start" /> Save
        </SavingButton>
      </td>
    </tr>
  )
}

function NewItemForm({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ id: "", kind: "feature" as Kind, categoryId: "", label: "", blurb: "", icon: "Package", price: "0", complexity: "m" })

  const create = useMutation({
    mutationFn: () =>
      createPricingItem({
        itemId: form.id.trim(),
        kind: form.kind,
        categoryId: form.categoryId.trim(),
        label: form.label.trim(),
        blurb: form.blurb.trim(),
        icon: form.icon.trim(),
        price: Number(form.price),
        complexity: form.complexity as PricingItemRow["complexity"],
        recommends: [],
        requires: [],
        addons: [],
        active: true,
        sort: 999,
      } as Omit<PricingItemRow, "id" | "createdAt" | "updatedAt">),
    onSuccess: () => {
      toast.success("Item created")
      void queryClient.invalidateQueries({ queryKey: ["pricing"] })
      onDone()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const ready = form.id.trim() && form.label.trim() && form.categoryId.trim() && Number.isInteger(Number(form.price))

  return (
    <form
      className="mb-6 grid gap-4 rounded-xl border border-border bg-muted/40 p-5 sm:grid-cols-2 lg:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault()
        create.mutate()
      }}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="new-id">Catalogue id</Label>
        <Input id="new-id" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="loyalty-tiers" required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="new-kind">Kind</Label>
        <select
          id="new-kind"
          value={form.kind}
          onChange={(e) => setForm({ ...form, kind: e.target.value as Kind })}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          {kinds.map((k) => (
            <option key={k} value={k}>
              {kindLabels[k]}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="new-category">Category id</Label>
        <Input id="new-category" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} placeholder="commerce" required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="new-label">Label</Label>
        <Input id="new-label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required />
      </div>
      <div className="grid gap-1.5 sm:col-span-2">
        <Label htmlFor="new-blurb">Blurb</Label>
        <Input id="new-blurb" value={form.blurb} onChange={(e) => setForm({ ...form, blurb: e.target.value })} placeholder="One sentence the customer sees." />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="new-icon">Lucide icon</Label>
        <Input id="new-icon" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="new-price">Price (GBP)</Label>
        <Input id="new-price" type="number" min={0} step={50} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="new-complexity">Complexity</Label>
        <select
          id="new-complexity"
          value={form.complexity}
          onChange={(e) => setForm({ ...form, complexity: e.target.value })}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          {["s", "m", "l", "xl"].map((c) => (
            <option key={c} value={c}>
              {c.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3">
        <SavingButton pending={create.isPending} type="submit" size="lg" disabled={!ready}>
          Create item
        </SavingButton>
        <Button type="button" variant="ghost" size="lg" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function useMultiplierRows() {
  return useQuery({
    queryKey: ["pricing", "multipliers"] as const,
    queryFn: async () => {
      const res = await fetch("/api/admin/pricing/multipliers")
      if (!res.ok) throw new Error("Couldn't load multipliers")
      return (await res.json()) as PricingMultiplierRow[]
    },
  })
}

function MultipliersTab({ canEdit }: { canEdit: boolean }) {
  const queryClient = useQueryClient()
  const rows = useMultiplierRows()

  const save = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<PricingMultiplierRow> }) => updatePricingMultiplier(id, patch),
    onSuccess: () => {
      toast.success("Multiplier updated")
      void queryClient.invalidateQueries({ queryKey: ["pricing"] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  if (rows.isPending) return <LoadingBlock label="Loading multipliers" rows={3} />
  if (rows.isError) return <ErrorBlock error={rows.error} onRetry={() => rows.refetch()} />

  return (
    <div className="grid gap-6">
      {(Object.keys(groupLabels) as PricingMultiplierRow["group"][]).map((group) => {
        const groupRows = rows.data.filter((row) => row.group === group).sort((a, b) => a.sort - b.sort)
        return (
          <Panel key={group} title={groupLabels[group].title} description={groupLabels[group].description}>
            <TableScroll>
              <table className="w-full min-w-[42rem] text-sm">
                <thead>
                  <tr className="border-b border-border text-left font-mono text-[0.65rem] tracking-[0.1em] text-muted-foreground uppercase">
                    <th className="py-2 pr-4 font-medium">Option</th>
                    <th className="py-2 pr-4 font-medium">Multiplier</th>
                    {group === "timeline" ? <th className="py-2 pr-4 font-medium">Weeks</th> : null}
                    <th className="py-2 pr-4 font-medium">Uplift</th>
                    <th className="py-2 font-medium sr-only">Save</th>
                  </tr>
                </thead>
                <tbody>
                  {groupRows.map((row) => (
                    <MultiplierRow
                      key={row.id}
                      row={row}
                      canEdit={canEdit}
                      saving={save.isPending}
                      onSave={(patch) => save.mutate({ id: row.id, patch })}
                    />
                  ))}
                </tbody>
              </table>
            </TableScroll>
          </Panel>
        )
      })}
    </div>
  )
}

function MultiplierRow({
  row,
  canEdit,
  onSave,
  saving,
}: {
  row: PricingMultiplierRow
  canEdit: boolean
  onSave: (patch: Partial<PricingMultiplierRow>) => void
  saving: boolean
}) {
  const [multiplier, setMultiplier] = useState(String(row.multiplier))
  const [weeks, setWeeks] = useState(row.weeks === null ? "" : String(row.weeks))
  const parsed = Number(multiplier)
  const parsedWeeks = weeks === "" ? null : Number(weeks)
  const valid = parsed > 0 && (parsedWeeks === null || parsedWeeks > 0)
  const dirty = multiplier !== String(row.multiplier) || weeks !== (row.weeks === null ? "" : String(row.weeks))
  const uplift = Math.round((parsed - 1) * 100)

  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="py-3 pr-4">
        <span className="font-medium">{row.label}</span>
        <span className="block text-xs text-muted-foreground">{row.description}</span>
      </td>
      <td className="py-3 pr-4">
        <Input
          type="number"
          min={0.1}
          step={0.01}
          value={multiplier}
          disabled={!canEdit}
          aria-label={`Multiplier for ${row.label}`}
          onChange={(e) => setMultiplier(e.target.value)}
          className="h-9 w-24"
        />
      </td>
      {row.group === "timeline" ? (
        <td className="py-3 pr-4">
          <Input
            type="number"
            min={1}
            step={1}
            value={weeks}
            disabled={!canEdit}
            aria-label={`Delivery weeks for ${row.label}`}
            onChange={(e) => setWeeks(e.target.value)}
            className="h-9 w-20"
          />
        </td>
      ) : null}
      <td className="py-3 pr-4 font-mono text-xs">{Number.isFinite(uplift) ? (uplift === 0 ? "No change" : `${uplift > 0 ? "+" : ""}${uplift}%`) : "—"}</td>
      <td className="py-3">
        <SavingButton
          pending={saving}
          size="sm"
          variant="outline"
          disabled={!canEdit || !dirty || !valid}
          onClick={() => onSave({ multiplier: parsed, ...(row.group === "timeline" ? { weeks: parsedWeeks } : {}) })}
          aria-label={`Save ${row.label}`}
        >
          <Save data-icon="inline-start" /> Save
        </SavingButton>
      </td>
    </tr>
  )
}

function SettingsTab({ canEdit, settings }: { canEdit: boolean; settings: { additionalSolutionFactor: number; rangeLow: number; rangeHigh: number; roundTo: number } }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    additionalSolutionFactor: String(settings.additionalSolutionFactor),
    rangeLow: String(settings.rangeLow),
    rangeHigh: String(settings.rangeHigh),
    roundTo: String(settings.roundTo),
  })

  const save = useMutation({
    mutationFn: () =>
      updatePricingSettings({
        additionalSolutionFactor: Number(form.additionalSolutionFactor),
        rangeLow: Number(form.rangeLow),
        rangeHigh: Number(form.rangeHigh),
        roundTo: Number(form.roundTo),
      }),
    onSuccess: () => {
      toast.success("Settings saved")
      void queryClient.invalidateQueries({ queryKey: ["pricing"] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const fields: { key: keyof typeof form; label: string; hint: string; step: number; min: number }[] = [
    { key: "additionalSolutionFactor", label: "Additional solution factor", hint: "Each extra solution beyond the first counts at this fraction of its price.", step: 0.05, min: 0 },
    { key: "rangeLow", label: "Range low", hint: "Lower bound of the indicative range, as a multiple of the total.", step: 0.01, min: 0.1 },
    { key: "rangeHigh", label: "Range high", hint: "Upper bound of the indicative range.", step: 0.01, min: 0.1 },
    { key: "roundTo", label: "Round to", hint: "Totals are rounded to the nearest multiple of this, in GBP.", step: 50, min: 1 },
  ]

  const valid = fields.every((field) => Number(form[field.key]) >= field.min) && Number(form.rangeHigh) >= Number(form.rangeLow)

  return (
    <Panel title="Estimate settings" description="Global rules applied to every automated estimate.">
      <form
        className="grid gap-5 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault()
          save.mutate()
        }}
      >
        {fields.map((field) => (
          <div key={field.key} className="grid gap-1.5">
            <Label htmlFor={`setting-${field.key}`}>{field.label}</Label>
            <Input
              id={`setting-${field.key}`}
              type="number"
              step={field.step}
              min={field.min}
              disabled={!canEdit}
              value={form[field.key]}
              onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">{field.hint}</p>
          </div>
        ))}
        <div className="sm:col-span-2">
          <SavingButton pending={save.isPending} type="submit" size="lg" disabled={!canEdit || !valid}>
            <Save data-icon="inline-start" /> Save settings
          </SavingButton>
          {!valid ? <p className="mt-2 text-sm text-destructive">Range high must be at least range low, and every value positive.</p> : null}
        </div>
      </form>
      <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
        Worked example: a {gbp(40000)} subtotal with a 1.20 timeline multiplier becomes {gbp(48000)} before rounding.
      </p>
    </Panel>
  )
}
