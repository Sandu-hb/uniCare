import { apiClient } from '@/lib/api-client'
import type { PharmacyPrescription } from './types'

/** Returns null when no prescription exists for this visit — the API answers 404. */
export async function getPrescription(visitId: string): Promise<PharmacyPrescription | null> {
  try {
    const { data } = await apiClient.get<PharmacyPrescription>(`/pharmacy/prescriptions/${visitId}`)
    return data
  } catch (error) {
    if (isNotFound(error)) return null
    throw error
  }
}

export async function dispensePrescription(visitId: string): Promise<PharmacyPrescription> {
  const { data } = await apiClient.post<PharmacyPrescription>(`/pharmacy/prescriptions/${visitId}/dispense`)
  return data
}

function isNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' && error !== null &&
    'response' in error &&
    (error as { response?: { status?: number } }).response?.status === 404
  )
}
