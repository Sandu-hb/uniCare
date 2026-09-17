import { apiClient } from '@/lib/api-client'
import type { DocumentType, MedicalDocument } from './types'

const base = (studentId: string) => `/students/${studentId}/documents`

export async function getDocuments(studentId: string): Promise<MedicalDocument[]> {
  const { data } = await apiClient.get<MedicalDocument[]>(base(studentId))
  return data
}

/** Fetches the file itself as a Blob, for opening it in a new tab. */
export async function getDocumentContent(studentId: string, documentId: string): Promise<Blob> {
  const { data } = await apiClient.get<Blob>(`${base(studentId)}/${documentId}/content`, {
    responseType: 'blob',
  })
  return data
}

export async function uploadDocument(
  studentId: string,
  file: File,
  documentType: DocumentType,
): Promise<MedicalDocument> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('documentType', documentType)

  const { data } = await apiClient.post<MedicalDocument>(base(studentId), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
