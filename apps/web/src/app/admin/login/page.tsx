import { LoginForm } from "@/components/admin/login-form"
import { LogoMark } from "@/components/layout/logo"

export const metadata = { title: "Sign in" }

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { next } = await searchParams
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark className="size-11" />
          <h1 className="mt-5 text-2xl font-semibold">Cybercina Admin</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Sign in to manage website enquiries.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-slate-900/5 sm:p-8">
          <LoginForm next={typeof next === "string" ? next : undefined} />
        </div>
      </div>
    </main>
  )
}
