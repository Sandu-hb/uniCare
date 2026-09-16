import { apiClient } from '@/lib/api-client'
import type { Consultation, UpsertConsultationRequest } from './types'

/** Returns null when nothing has been recorded yet — the API answers 404. */
export async function getConsultation(visitId: string): Promise<Consultation | null> {
  try {
    const { data } = await apiClient.get<Consultation>(`/visits/${visitId}/consultation`)
    return data
  } catch (error) {
    if (isNotFound(error)) return null
    throw error
  }
}

export async function upsertConsultation(
  visitId: string, request: UpsertConsultationRequest,
): Promise<Consultation> {
  const { data } = await apiClient.put<Consultation>(`/visits/${visitId}/consultation`, request)
  return data
}

function isNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' && error !== null &&
    'response' in error &&
    (error as { response?: { status?: number } }).response?.status === 404
  )
}
