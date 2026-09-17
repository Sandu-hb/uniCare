import { apiClient } from '@/lib/api-client'
import type { CompleteLabOrderRequest, LabOrder } from './types'

/** Returns null when no lab order exists for this visit — the API answers 404. */
export async function getLabOrder(visitId: string): Promise<LabOrder | null> {
  try {
    const { data } = await apiClient.get<LabOrder>(`/laboratory/orders/${visitId}`)
    return data
  } catch (error) {
    if (isNotFound(error)) return null
    throw error
  }
}

export async function completeLabOrder(
  visitId: string, request: CompleteLabOrderRequest,
): Promise<LabOrder> {
  const { data } = await apiClient.post<LabOrder>(`/laboratory/orders/${visitId}/complete`, request)
  return data
}

function isNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' && error !== null &&
    'response' in error &&
    (error as { response?: { status?: number } }).response?.status === 404
  )
}
