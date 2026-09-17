import { apiClient } from '@/lib/api-client'
import type { CheckInRequest, QueueStage, Visit } from './types'

export async function checkIn(studentId: string, request: CheckInRequest): Promise<Visit> {
  const { data } = await apiClient.post<Visit>(`/students/${studentId}/check-in`, request)
  return data
}

export async function getQueue(stage: QueueStage): Promise<Visit[]> {
  const { data } = await apiClient.get<Visit[]>('/visits/queue', { params: { stage } })
  return data
}

export async function getVisit(id: string): Promise<Visit> {
  const { data } = await apiClient.get<Visit>(`/visits/${id}`)
  return data
}

export async function callVisit(id: string): Promise<Visit> {
  const { data } = await apiClient.post<Visit>(`/visits/${id}/call`)
  return data
}

export async function abandonVisit(id: string): Promise<Visit> {
  const { data } = await apiClient.post<Visit>(`/visits/${id}/abandon`)
  return data
}
