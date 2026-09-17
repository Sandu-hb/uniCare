import { apiClient } from '@/lib/api-client'
import type { VisitHistory } from './types'

export async function getVisitHistory(studentId: string): Promise<VisitHistory[]> {
  const { data } = await apiClient.get<VisitHistory[]>(`/students/${studentId}/visit-history`)
  return data
}
