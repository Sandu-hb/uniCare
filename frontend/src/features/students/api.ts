import { apiClient } from '@/lib/api-client'
import type { PagedResult } from '@/types/api'
import type { CreateStudentRequest, Student } from './types'

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

export async function createStudent(request: CreateStudentRequest): Promise<Student> {
  const { data } = await apiClient.post<Student>('/students', request)
  return data
}
