import axios, { AxiosError } from 'axios'

/**
 * Shared HTTP client for the UniCare API.
 *
 * The base URL is relative on purpose: in development Vite proxies `/api` to the
 * ASP.NET Core backend (see vite.config.ts), and in production the SPA is served
 * from the same origin. Either way the browser sees one origin and CORS never
 * enters the picture.
 */
export const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

const TOKEN_KEY = 'unicare.token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    // Private browsing and blocked site data both throw here.
    return null
  }
}

export function setToken(token: string | null): void {
  try {
    if (token === null) localStorage.removeItem(TOKEN_KEY)
    else localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // Non-fatal: the user stays logged in for this tab only.
  }
}

// Attach the JWT to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/**
 * A 401 means the token is missing, expired or rejected. Clear it and bounce to
 * login rather than letting each screen invent its own handling.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      setToken(null)
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)

/** Pulls a readable message out of an axios error for display. */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { title?: string; detail?: string } | undefined
    return data?.detail ?? data?.title ?? error.message
  }
  return error instanceof Error ? error.message : fallback
}
