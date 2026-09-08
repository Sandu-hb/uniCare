import { apiClient } from '@/lib/api-client'
import type { MedicalProfile, UpsertMedicalProfileRequest } from './types'

const base = (studentId: string) => `/students/${studentId}/medical-profile`

/** Returns null when the student has no profile yet — the API answers 404. */
export async function getMedicalProfile(studentId: string): Promise<MedicalProfile | null> {
  try {
    const { data } = await apiClient.get<MedicalProfile>(base(studentId))
    return data
  } catch (error) {
    if (isNotFound(error)) return null
    throw error
  }
}

export async function upsertMedicalProfile(
  studentId: string,
  request: UpsertMedicalProfileRequest,
): Promise<MedicalProfile> {
  const { data } = await apiClient.put<MedicalProfile>(base(studentId), request)
  return data
}

export async function submitMedicalProfile(studentId: string): Promise<MedicalProfile> {
  const { data } = await apiClient.post<MedicalProfile>(`${base(studentId)}/submit`)
  return data
}

// The reviewer is derived server-side from the bearer token — apiClient's
// interceptor already attaches it to every request, so there is nothing left
// to pass here.
export async function verifyMedicalProfile(studentId: string): Promise<MedicalProfile> {
  const { data } = await apiClient.post<MedicalProfile>(`${base(studentId)}/verify`)
  return data
}

export async function rejectMedicalProfile(
  studentId: string, reason: string,
): Promise<MedicalProfile> {
  const { data } = await apiClient.post<MedicalProfile>(`${base(studentId)}/reject`, { reason })
  return data
}

function isNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' && error !== null &&
    'response' in error &&
    (error as { response?: { status?: number } }).response?.status === 404
  )
}
