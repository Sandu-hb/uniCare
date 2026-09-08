import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { clearToken, readRefreshToken, readToken, writeTokens } from './token-storage'

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

// Attach the JWT to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = readToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Variables for managing silent refresh concurrency
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else if (token) {
      promise.resolve(token)
    }
  })
  failedQueue = []
}

/**
 * Handle 401 Unauthorized errors by silently refreshing the access token.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Do not attempt refresh on auth endpoints themselves
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.url?.includes('/auth/logout')
      ) {
        clearToken()
        if (window.location.pathname !== '/login') {
          window.location.assign('/login')
        }
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = readRefreshToken()
      if (!refreshToken) {
        clearToken()
        isRefreshing = false
        if (window.location.pathname !== '/login') {
          window.location.assign('/login')
        }
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post<{ token: string; refreshToken: string }>(
          '/api/auth/refresh',
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        )

        writeTokens(data.token, data.refreshToken)
        apiClient.defaults.headers.common.Authorization = `Bearer ${data.token}`
        originalRequest.headers.Authorization = `Bearer ${data.token}`

        processQueue(null, data.token)
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearToken()
        if (window.location.pathname !== '/login') {
          window.location.assign('/login')
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
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
