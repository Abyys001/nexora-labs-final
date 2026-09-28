"use client"

import { useCallback, useEffect, useState } from "react"

export type BuilderState = {
  step: number
  /** Priced selections — ids resolve against the live pricing catalogue. */
  solutionTypes: string[]
  features: string[]
  platforms: string[]
  integrations: string[]
  ai: string[]
  design: string[]
  support: string
  maintenance: string
  complexity: string
  timeline: string
  userScale: string
  /** Unpriced context. */
  industries: string[]
  goals: string[]
  successCriteria: string
  designNotes: string
  notes: string
  startDate: string
  /** Contact. */
  name: string
  email: string
  company: string
  phone: string
  companySize: string
  website: string
  preferredContact: string
  /** Commercial preferences. */
  currency: string
  paymentPreference: string
  /** Smart-recommendation rules the visitor has dismissed. */
  dismissed: string[]
}

export type ListKey = { [K in keyof BuilderState]: BuilderState[K] extends string[] ? K : never }[keyof BuilderState]

export const initialBuilderState: BuilderState = {
  step: 0,
  solutionTypes: [],
  features: [],
  platforms: [],
  integrations: [],
  ai: [],
  design: [],
  support: "",
  maintenance: "",
  complexity: "standard",
  timeline: "flexible",
  userScale: "",
  industries: [],
  goals: [],
  successCriteria: "",
  designNotes: "",
  notes: "",
  startDate: "",
  name: "",
  email: "",
  company: "",
  phone: "",
  companySize: "",
  website: "",
  preferredContact: "email",
  currency: "GBP",
  paymentPreference: "undecided",
  dismissed: [],
}

// v2: the state shape changed with the catalogue-driven builder, so a v1 draft
// left in a tab is dropped rather than half-restored.
const STORAGE_KEY = "nexora:project-builder:v2"

function load(): Partial<BuilderState> | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Partial<BuilderState>) : null
  } catch {
    return null
  }
}

/** Builder state autosaved to sessionStorage, so a refresh or a detour keeps the configuration for this tab. */
export function useBuilderState(seed: (s: BuilderState) => BuilderState) {
  const [state, setState] = useState(initialBuilderState)
  const [restored, setRestored] = useState(false)
  // State, not a ref: saving must wait until the restored state has actually rendered,
  // otherwise the defaults from the first render overwrite what was just loaded.
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const saved = load()
    // Restoring from browser storage has to happen after hydration; the server render has no access to it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(saved ? { ...initialBuilderState, ...saved } : seed(initialBuilderState))
    setRestored(!!saved && (saved.step ?? 0) > 0)
    setHydrated(true)
    // Seed only applies on first load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage can be unavailable (private mode, quota); autosave is a convenience only.
    }
  }, [state, hydrated])

  const set = useCallback(<K extends keyof BuilderState>(key: K, value: BuilderState[K]) => setState((s) => ({ ...s, [key]: value })), [])

  const toggle = useCallback((key: ListKey, id: string, on?: boolean) => {
    setState((s) => {
      const has = s[key].includes(id)
      const next = on ?? !has
      if (next === has) return s
      return { ...s, [key]: next ? [...s[key], id] : s[key].filter((x) => x !== id) }
    })
  }, [])

  const reset = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // See above.
    }
    setState(initialBuilderState)
    setRestored(false)
  }, [])

  const clear = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // See above.
    }
  }, [])

  return { state, set, toggle, reset, clear, restored, hydrated }
}
