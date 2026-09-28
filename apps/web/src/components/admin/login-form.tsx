"use client"

import { Loader2, LockKeyhole } from "lucide-react"
import { useActionState } from "react"

import { login, type LoginState } from "@/app/actions/auth"
import { Field, TextInput } from "@/components/forms/fields"
import { FormError } from "@/components/forms/form-status"
import { Button } from "@/components/ui/button"

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {})
  return (
    <form action={action} className="grid gap-5">
      <input type="hidden" name="next" value={next ?? ""} />
      <Field id="email" label="Email">
        <TextInput id="email" name="email" type="email" autoComplete="username" required autoFocus />
      </Field>
      <Field id="password" label="Password">
        <TextInput id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      {state.error ? <FormError message={state.error} /> : null}
      <Button type="submit" size="xl" disabled={pending} className="mt-2 w-full">
        {pending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <LockKeyhole data-icon="inline-start" />}
        Sign in
      </Button>
    </form>
  )
}
