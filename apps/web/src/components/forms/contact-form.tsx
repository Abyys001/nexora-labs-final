"use client"

import { Loader2, Send } from "lucide-react"
import { useActionState, useRef, useState, startTransition, type FormEvent } from "react"
import { z } from "zod"

import { submitEnquiry, type EnquiryState } from "@/app/actions/enquiry"
import { Button } from "@/components/ui/button"
import { budgets, contactMethods, enquirySchema, formDataToEnquiry, projectTypes, type FieldErrors } from "@/lib/enquiry"

import { ChoiceCards, describedBy, Field, Honeypot, NativeSelect, TextArea, TextInput } from "./fields"
import { FormError, FormSuccess } from "./form-status"

export function ContactForm() {
  const [state, action, pending] = useActionState<EnquiryState, FormData>(submitEnquiry, { status: "idle" })
  const [clientErrors, setClientErrors] = useState<FieldErrors>({})
  const formRef = useRef<HTMLFormElement>(null)

  const errors: FieldErrors = { ...(state.status === "error" ? state.fieldErrors : {}), ...clientErrors }
  const err = (k: keyof FieldErrors) => errors[k]?.[0]

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const parsed = enquirySchema.safeParse(formDataToEnquiry(formData))
    if (!parsed.success) {
      const fieldErrors = z.flattenError(parsed.error).fieldErrors as FieldErrors
      setClientErrors(fieldErrors)
      const first = Object.keys(fieldErrors)[0]
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    setClientErrors({})
    // Calling the action manually avoids React's automatic form reset, so input survives a failed send.
    startTransition(() => action(formData))
  }

  if (state.status === "success") {
    return (
      <FormSuccess title="Thank you, we've received your enquiry">
        <p>We&apos;ll review your project details and reply within one business day.</p>
      </FormSuccess>
    )
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-2xl shadow-ink-800/5">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-soft px-6 py-3.5 sm:px-8">
        <span className="flex items-center gap-2 font-pixel text-[0.65rem] text-foreground/70">
          <span aria-hidden="true" className="size-2 rounded-[2px] bg-lime" />
          0x000000 · new-enquiry
        </span>
        <span className="font-mono text-[0.65rem] tracking-wide text-muted-foreground uppercase">Reply in 1 business day</span>
      </div>
      <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8 lg:p-10">
      <input type="hidden" name="source" value="contact" />
      <Honeypot />
      <Field id="name" label="Name" error={err("name")}>
        <TextInput id="name" name="name" autoComplete="name" required aria-invalid={!!err("name")} aria-describedby={describedBy("name", err("name"))} />
      </Field>
      <Field id="company" label="Company" optional error={err("company")}>
        <TextInput id="company" name="company" autoComplete="organization" aria-invalid={!!err("company")} aria-describedby={describedBy("company", err("company"))} />
      </Field>
      <Field id="email" label="Email" error={err("email")}>
        <TextInput id="email" name="email" type="email" autoComplete="email" required aria-invalid={!!err("email")} aria-describedby={describedBy("email", err("email"))} />
      </Field>
      <Field id="phone" label="Phone" optional error={err("phone")}>
        <TextInput id="phone" name="phone" type="tel" autoComplete="tel" aria-invalid={!!err("phone")} aria-describedby={describedBy("phone", err("phone"))} />
      </Field>
      <Field id="projectType" label="Project type" error={err("projectType")}>
        <NativeSelect id="projectType" name="projectType" options={projectTypes} placeholder="Select a project type" required defaultValue="" aria-invalid={!!err("projectType")} aria-describedby={describedBy("projectType", err("projectType"))} />
      </Field>
      <Field id="budget" label="Estimated budget" error={err("budget")}>
        <NativeSelect id="budget" name="budget" options={budgets} placeholder="Select a budget range" required defaultValue="" aria-invalid={!!err("budget")} aria-describedby={describedBy("budget", err("budget"))} />
      </Field>
      <Field id="description" label="Project description" error={err("description")} hint="What are you trying to achieve? What problem are you solving?" className="sm:col-span-2">
        <TextArea id="description" name="description" required aria-invalid={!!err("description")} aria-describedby={describedBy("description", err("description"), "hint")} />
      </Field>
      <div className="sm:col-span-2">
        <ChoiceCards name="preferredContact" legend="Preferred contact method" options={contactMethods} defaultValue="email" columns={3} />
      </div>
      {state.status === "error" ? <div className="sm:col-span-2"><FormError message={state.message} /></div> : null}
      <div className="flex flex-col-reverse items-start gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted-foreground">
          By sending this form you agree to our <a href="/privacy-policy" className="underline hover:text-foreground">privacy policy</a>.
        </p>
        <Button type="submit" size="xl" disabled={pending} className="group w-full sm:w-auto">
          {pending ? <><Loader2 className="animate-spin" data-icon="inline-start" /> Sending…</> : <>Send Project Enquiry <Send className="arrow-nudge" data-icon="inline-end" /></>}
        </Button>
      </div>
      </form>
    </div>
  )
}
