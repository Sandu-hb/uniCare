import type { AccountStatus } from '@/features/auth/types'
import { apiClient } from '@/lib/api-client'
import type { PagedResult } from '@/types/api'
import type { CreateStaffRequest, Staff, StaffRole } from './types'

export interface SearchStaffParams {
  status?: AccountStatus
  role?: StaffRole
  page?: number
  pageSize?: number
}

/** Admin-only: every staff account, regardless of role. */
export async function searchStaff(params: SearchStaffParams): Promise<PagedResult<Staff>> {
  const { data } = await apiClient.get<PagedResult<Staff>>('/staff', { params })
  return data
}

export async function getStaff(id: string): Promise<Staff> {
  const { data } = await apiClient.get<Staff>(`/staff/${id}`)
  return data
}

/** Admin-created, any role. The account is Active immediately — no approval step. */
export async function createStaff(request: CreateStaffRequest): Promise<Staff> {
  const { data } = await apiClient.post<Staff>('/staff', request)
  return data
}

export async function activateStaff(id: string): Promise<Staff> {
  const { data } = await apiClient.post<Staff>(`/staff/${id}/activate`)
  return data
}

export async function suspendStaff(id: string): Promise<Staff> {
  const { data } = await apiClient.post<Staff>(`/staff/${id}/suspend`)
  return data
}

/**
 * Generates a fresh temporary password and re-sends the welcome email — for
 * when the original never arrived (e.g. sent before SMTP was configured).
 * The old password stops working immediately.
 */
export async function resendStaffCredentials(id: string): Promise<Staff> {
  const { data } = await apiClient.post<Staff>(`/staff/${id}/resend-credentials`)
  return data
}
