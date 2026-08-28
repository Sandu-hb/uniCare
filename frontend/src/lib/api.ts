import axios from 'axios'

/**
 * Shared HTTP client for the UniCare API.
 *
 * The base URL is relative on purpose: in development Vite proxies `/api` to the
 * ASP.NET Core backend (see vite.config.ts), and in production the API is served
 * from the same origin as the SPA. Either way the browser sees one origin.
 */
export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

export interface HealthResponse {
  status: string
  database: string
  environment: string
  timestamp: string
}

export async function getHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>('/health')
  return data
}
