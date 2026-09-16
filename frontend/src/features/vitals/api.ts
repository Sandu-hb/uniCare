import { apiClient } from '@/lib/api-client'
import type { UpsertVitalSignRequest, VitalSign } from './types'

/** Returns null when nothing has been recorded yet — the API answers 404. */
export async function getVitalSign(visitId: string): Promise<VitalSign | null> {
  try {
    const { data } = await apiClient.get<VitalSign>(`/visits/${visitId}/vital-sign`)
    return data
  } catch (error) {
    if (isNotFound(error)) return null
    throw error
  }
}

export async function upsertVitalSign(
  visitId: string, request: UpsertVitalSignRequest,
): Promise<VitalSign> {
  const { data } = await apiClient.put<VitalSign>(`/visits/${visitId}/vital-sign`, request)
  return data
}

function isNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' && error !== null &&
    'response' in error &&
    (error as { response?: { status?: number } }).response?.status === 404
  )
}
