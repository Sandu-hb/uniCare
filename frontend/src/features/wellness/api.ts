import { apiClient } from '@/lib/api-client'
import type { CounselingSession, CounselingSessionSummary } from './types'

export async function startOrResumeSession(): Promise<CounselingSession> {
  const { data } = await apiClient.post<CounselingSession>('/wellness/sessions')
  return data
}

export async function sendMessage(sessionId: string, content: string): Promise<CounselingSession> {
  const { data } = await apiClient.post<CounselingSession>(
    `/wellness/sessions/${sessionId}/messages`,
    { content },
  )
  return data
}

export async function getOwnSessions(): Promise<CounselingSessionSummary[]> {
  const { data } = await apiClient.get<CounselingSessionSummary[]>('/wellness/sessions')
  return data
}

export async function getOwnSessionDetail(sessionId: string): Promise<CounselingSession> {
  const { data } = await apiClient.get<CounselingSession>(`/wellness/sessions/${sessionId}`)
  return data
}

export async function getFlaggedSessions(): Promise<CounselingSessionSummary[]> {
  const { data } = await apiClient.get<CounselingSessionSummary[]>('/wellness/alerts')
  return data
}

export async function getFlaggedSessionDetail(sessionId: string): Promise<CounselingSession> {
  const { data } = await apiClient.get<CounselingSession>(`/wellness/alerts/${sessionId}`)
  return data
}
