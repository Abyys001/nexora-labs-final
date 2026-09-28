"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { UserPlus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useAdmin } from "./admin-context"
import { adminKeys, createAdmin, fetchAdmins, updateAdmin, type AdminRole, type AdminSummary } from "./api"
import { ErrorBlock, LoadingBlock, PageHeader, Panel, Pill, SavingButton, shortDate, TableScroll } from "./ui"

const roles: { value: AdminRole; label: string; description: string }[] = [
  { value: "viewer", label: "Viewer", description: "Read everything; change nothing." },
  { value: "manager", label: "Manager", description: "Set prices, draft and publish proposals, record payments." },
  { value: "owner", label: "Owner", description: "Everything a manager can do, plus managing admins." },
]

const roleTone: Record<AdminRole, "neutral" | "accent" | "positive"> = { viewer: "neutral", manager: "accent", owner: "positive" }

export function AdminsManager() {
  const me = useAdmin()
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: adminKeys.list, queryFn: fetchAdmins })
  const [adding, setAdding] = useState(false)

  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: AdminRole }) => updateAdmin(id, { role }),
    onSuccess: () => {
      toast.success("Role updated")
      void queryClient.invalidateQueries({ queryKey: adminKeys.list })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return (
    <>
      <PageHeader
        title="Admins & Roles"
        description="Who can sign in to this panel and what they're allowed to change. Every role change is recorded in the audit log."
        action={
          <Button size="lg" variant="outline" onClick={() => setAdding((open) => !open)}>
            <UserPlus data-icon="inline-start" /> {adding ? "Cancel" : "New admin"}
          </Button>
        }
      />

      {adding ? <NewAdminForm onDone={() => setAdding(false)} /> : null}

      <Panel title="Roles" description="Least privilege by default — give people the narrowest role that lets them do their job." className="mb-6">
        <ul className="grid gap-3 sm:grid-cols-3">
          {roles.map((role) => (
            <li key={role.value} className="rounded-xl border border-border p-4">
              <Pill tone={roleTone[role.value]}>{role.label}</Pill>
              <p className="mt-2 text-sm text-muted-foreground">{role.description}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Accounts">
        {query.isPending ? (
          <LoadingBlock label="Loading admins" rows={3} />
        ) : query.isError ? (
          <ErrorBlock error={query.error} onRetry={() => query.refetch()} />
        ) : (
          <TableScroll>
            <table className="w-full min-w-[38rem] text-sm">
              <thead>
                <tr className="border-b border-border text-left font-mono text-[0.65rem] tracking-[0.1em] text-muted-foreground uppercase">
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Email</th>
                  <th className="py-2 pr-4 font-medium">Role</th>
                  <th className="py-2 font-medium">Added</th>
                </tr>
              </thead>
              <tbody>
                {query.data.map((row: AdminSummary) => {
                  const isMe = row.id === me.id
                  return (
                    <tr key={row.id} className="border-b border-border/60 last:border-0">
                      <td className="py-3 pr-4 font-medium">
                        {row.name || "—"}
                        {isMe ? <span className="ml-2 text-xs text-muted-foreground">(you)</span> : null}
                      </td>
                      <td className="py-3 pr-4 text-xs">{row.email}</td>
                      <td className="py-3 pr-4">
                        <select
                          value={row.role}
                          disabled={isMe || changeRole.isPending}
                          aria-label={`Role for ${row.email}`}
                          onChange={(e) => changeRole.mutate({ id: row.id, role: e.target.value as AdminRole })}
                          className="h-8 rounded-md border border-input bg-background px-2 text-xs disabled:opacity-60"
                        >
                          {roles.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">{shortDate(row.createdAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </TableScroll>
        )}
        <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
          You can&apos;t change your own role — ask another owner, so an account can never lock the last owner out.
        </p>
      </Panel>
    </>
  )
}

function NewAdminForm({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ email: "", name: "", role: "viewer" as AdminRole, password: "" })

  const create = useMutation({
    mutationFn: () => createAdmin({ email: form.email.trim(), name: form.name.trim(), role: form.role, password: form.password }),
    onSuccess: () => {
      toast.success("Admin created")
      void queryClient.invalidateQueries({ queryKey: adminKeys.list })
      onDone()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const ready = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()) && form.name.trim().length >= 2 && form.password.length >= 12

  return (
    <Panel title="New admin" description="Send the password over a channel the person already trusts, and ask them to change it after signing in." className="mb-6">
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault()
          create.mutate()
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="admin-name">Name</Label>
          <Input id="admin-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="off" required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="admin-email">Email</Label>
          <Input id="admin-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="off" required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="admin-role">Role</Label>
          <select
            id="admin-role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole })}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="admin-password">Initial password</Label>
          <Input
            id="admin-password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="new-password"
            minLength={12}
            required
          />
          <p className="text-xs text-muted-foreground">At least 12 characters.</p>
        </div>
        <div className="flex gap-2 sm:col-span-2">
          <SavingButton pending={create.isPending} type="submit" size="lg" disabled={!ready}>
            Create admin
          </SavingButton>
          <Button type="button" variant="ghost" size="lg" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </form>
    </Panel>
  )
}
