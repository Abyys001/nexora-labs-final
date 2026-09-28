import { ChevronDown } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { cn } from "@/lib/utils"

export const controlClass =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-[0.95rem] shadow-xs transition-[color,box-shadow,border-color] outline-none placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 aria-invalid:border-destructive aria-invalid:ring-destructive/15 disabled:opacity-60 dark:bg-white/[0.03]"

export function Field({
  id,
  label,
  error,
  hint,
  optional,
  children,
  className,
}: {
  id: string
  label: string
  error?: string
  hint?: string
  optional?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="font-mono text-xs font-semibold tracking-[0.08em] uppercase">
        {label}
        {optional ? <span className="ml-1.5 font-normal tracking-normal normal-case text-muted-foreground">(optional)</span> : null}
      </label>
      {children}
      {hint && !error ? <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p id={`${id}-error`} role="alert" className="text-sm font-medium text-destructive">{error}</p> : null}
    </div>
  )
}

export function describedBy(id: string, error?: string, hint?: string) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined
}

export function TextInput({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlClass, "h-12", className)} {...props} />
}

export function TextArea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(controlClass, "min-h-36 resize-y leading-relaxed", className)} {...props} />
}

export function NativeSelect({
  options,
  placeholder,
  className,
  ...props
}: ComponentProps<"select"> & { options: readonly { value: string; label: string }[]; placeholder?: string }) {
  return (
    <div className="relative">
      <select className={cn(controlClass, "h-12 appearance-none pr-11", className)} {...props}>
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
    </div>
  )
}

export function ChoiceCards({
  name,
  legend,
  options,
  type = "radio",
  defaultValue,
  error,
  columns = 2,
}: {
  name: string
  legend: string
  options: readonly { value: string; label: string; description?: string }[]
  type?: "radio" | "checkbox"
  defaultValue?: string | string[]
  error?: string
  columns?: 2 | 3
}) {
  const selected = Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : []
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="mb-3 text-sm font-semibold">{legend}</legend>
      <div className={cn("grid gap-3", columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3")}>
        {options.map((o) => (
          <label
            key={o.value}
            className="group relative flex cursor-pointer items-start gap-3 rounded-xl border border-input bg-background p-4 transition-colors hover:border-primary/40 has-checked:border-primary has-checked:bg-primary/[0.04] has-checked:ring-1 has-checked:ring-primary has-focus-visible:ring-4 has-focus-visible:ring-primary/20"
          >
            <input
              type={type}
              name={name}
              value={o.value}
              defaultChecked={selected.includes(o.value)}
              className="mt-0.5 size-4 shrink-0 accent-ink-800"
              aria-invalid={error ? true : undefined}
            />
            <span>
              <span className="block text-[0.95rem] font-medium">{o.label}</span>
              {o.description ? <span className="mt-0.5 block text-sm text-muted-foreground">{o.description}</span> : null}
            </span>
          </label>
        ))}
      </div>
      {error ? <p id={`${name}-error`} role="alert" className="mt-2 text-sm font-medium text-destructive">{error}</p> : null}
    </fieldset>
  )
}

// Hidden from humans and assistive tech; bots that fill every field reveal themselves.
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor="hp-field">Leave this field empty</label>
      <input id="hp-field" type="text" name="hp" tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  )
}
