import { apiClient } from '@/lib/api-client'

export interface HealthResponse {
  status: string
  database: string
  environment: string
  timestamp: string
}

export async function getHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>('/health')
  return data
}
