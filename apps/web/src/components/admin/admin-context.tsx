"use client"

import { createContext, useContext, type ReactNode } from "react"

import type { AdminProfile, AdminRole } from "./api"

const RANK: Record<AdminRole, number> = { viewer: 0, manager: 1, owner: 2 }

const AdminContext = createContext<AdminProfile | null>(null)

export function AdminContextProvider({ admin, children }: { admin: AdminProfile; children: ReactNode }) {
  return <AdminContext.Provider value={admin}>{children}</AdminContext.Provider>
}

/** The signed-in admin. Only rendered inside the authenticated panel layout, so this is never null there. */
export function useAdmin() {
  const admin = useContext(AdminContext)
  if (!admin) throw new Error("useAdmin must be used within the admin panel layout")
  return admin
}

/** Whether the signed-in admin meets the given minimum role (owner > manager > viewer). */
export function useCan(minRole: AdminRole) {
  const admin = useAdmin()
  return RANK[admin.role] >= RANK[minRole]
}
