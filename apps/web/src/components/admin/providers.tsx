"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"

import { Toaster } from "@/components/ui/sonner"

import { ApiError } from "./api"

export function AdminProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            retry: (count, error) => !(error instanceof ApiError && [401, 404].includes(error.status)) && count < 2,
          },
        },
      }),
  )
  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster position="bottom-right" richColors />
    </QueryClientProvider>
  )
}
