import "server-only"

// Internal API base: never exposed to the browser.
export const API_URL = (process.env.API_URL ?? "http://localhost:4000/api").replace(/\/$/, "")

export type ApiErrorBody = {
  error?: { code?: string; message?: string; details?: { fieldErrors?: Record<string, string[]> } }
}

export async function readApiError(res: Response): Promise<ApiErrorBody["error"]> {
  try {
    const body = (await res.json()) as ApiErrorBody
    return body.error
  } catch {
    return undefined
  }
}
