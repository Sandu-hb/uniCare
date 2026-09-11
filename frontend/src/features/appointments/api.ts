import { apiClient } from '@/lib/api-client'
import type { PagedResult } from '@/types/api'
import type {
  Appointment, AppointmentStatus, AssignableStaff, CreateAppointmentRequest,
} from './types'

export async function getForStudent(studentId: string): Promise<Appointment[]> {
  const { data } = await apiClient.get<Appointment[]>(`/students/${studentId}/appointments`)
  return data
}

export async function createAppointment(
  studentId: string, request: CreateAppointmentRequest,
): Promise<Appointment> {
  const { data } = await apiClient.post<Appointment>(`/students/${studentId}/appointments`, request)
  return data
}

export interface SearchAppointmentsParams {
  date?: string
  status?: AppointmentStatus
  page?: number
  pageSize?: number
}

/** Staff-only: the full queue, not scoped to one student. */
export async function searchAppointments(
  params: SearchAppointmentsParams,
): Promise<PagedResult<Appointment>> {
  const { data } = await apiClient.get<PagedResult<Appointment>>('/appointments', { params })
  return data
}

export async function approveAppointment(
  id: string, assignedStaffId?: string | null,
): Promise<Appointment> {
  const { data } = await apiClient.post<Appointment>(`/appointments/${id}/approve`, { assignedStaffId })
  return data
}

export async function rejectAppointment(id: string, reason: string): Promise<Appointment> {
  const { data } = await apiClient.post<Appointment>(`/appointments/${id}/reject`, { reason })
  return data
}

export async function assignAppointmentStaff(id: string, staffId: string): Promise<Appointment> {
  const { data } = await apiClient.post<Appointment>(`/appointments/${id}/assign`, { staffId })
  return data
}

export async function cancelAppointment(id: string): Promise<Appointment> {
  const { data } = await apiClient.post<Appointment>(`/appointments/${id}/cancel`)
  return data
}

/** Staff-only: backs the assign-staff dropdown on the queue page. */
export async function getAssignableStaff(): Promise<AssignableStaff[]> {
  const { data } = await apiClient.get<PagedResult<AssignableStaff>>('/staff', {
    params: { status: 'Active', pageSize: 100 },
  })
  return data.items
}
