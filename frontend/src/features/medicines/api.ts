import { apiClient } from '@/lib/api-client'
import type { Medicine } from './types'

export async function searchMedicines(search: string): Promise<Medicine[]> {
  const { data } = await apiClient.get<Medicine[]>('/medicines', { params: { search: search || undefined } })
  return data
}
