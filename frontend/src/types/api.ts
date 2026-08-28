/**
 * Shared response shapes returned by the UniCare API.
 *
 * Feature-specific types live in that feature's own types.ts; only things used
 * across features belong here.
 */

/** ASP.NET Core's ProblemDetails, returned by the API's exception middleware. */
export interface ProblemDetails {
  type?: string
  title?: string
  status?: number
  detail?: string
  errors?: Record<string, string[]>
}

/** Envelope for endpoints that page their results. */
export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}
