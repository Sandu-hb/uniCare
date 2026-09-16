import type { AccountStatus, LoginResponse } from '@/features/auth/types'
import { apiClient } from '@/lib/api-client'
import type { PagedResult } from '@/types/api'
import type { CreateStudentRequest, RegisterStudentRequest, Student, StudentAccount } from './types'

export interface SearchStudentsParams {
  search?: string
  page?: number
  pageSize?: number
}

export async function searchStudents(
  params: SearchStudentsParams,
): Promise<PagedResult<Student>> {
  const { data } = await apiClient.get<PagedResult<Student>>('/students', { params })
  return data
}

export async function getStudent(id: string): Promise<Student> {
  const { data } = await apiClient.get<Student>(`/students/${id}`)
  return data
}

/** Resolves the signed-in student's own record from their JWT. */
export async function getMe(): Promise<Student> {
  const { data } = await apiClient.get<Student>('/students/me')
  return data
}

export async function createStudent(request: CreateStudentRequest): Promise<Student> {
  const { data } = await apiClient.post<Student>('/students', request)
  return data
}

/**
 * Self-service registration. Logs the new account straight in — the account
 * itself starts PendingApproval, but that doesn't gate signing in; what
 * actually unlocks (booking an appointment) is gated on the medical profile
 * being Verified, checked independently at that point.
 */
export async function registerStudent(request: RegisterStudentRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/students/register', request)
  return data
}

export interface SearchStudentAccountsParams {
  status?: AccountStatus
  search?: string
  page?: number
  pageSize?: number
}

/** Admin-only: the approval queue. */
export async function searchStudentAccounts(
  params: SearchStudentAccountsParams,
): Promise<PagedResult<StudentAccount>> {
  const { data } = await apiClient.get<PagedResult<StudentAccount>>('/students/accounts', { params })
  return data
}

export async function activateStudent(id: string): Promise<StudentAccount> {
  const { data } = await apiClient.post<StudentAccount>(`/students/${id}/activate`)
  return data
}

export async function suspendStudent(id: string): Promise<StudentAccount> {
  const { data } = await apiClient.post<StudentAccount>(`/students/${id}/suspend`)
  return data
}
