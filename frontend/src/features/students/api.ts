import type { AccountStatus } from '@/features/auth/types'
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

/** Self-service registration. The resulting account starts PendingApproval. */
export async function registerStudent(request: RegisterStudentRequest): Promise<Student> {
  const { data } = await apiClient.post<Student>('/students/register', request)
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
