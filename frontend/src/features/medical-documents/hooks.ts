import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getDocuments, uploadDocument } from './api'
import type { DocumentType } from './types'

export const documentKeys = {
  all: ['documents'] as const,
  byStudent: (studentId: string) => [...documentKeys.all, studentId] as const,
}

export function useDocuments(studentId: string) {
  return useQuery({
    queryKey: documentKeys.byStudent(studentId),
    queryFn: () => getDocuments(studentId),
    enabled: Boolean(studentId),
  })
}

export function useUploadDocument(studentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ file, documentType }: { file: File; documentType: DocumentType }) =>
      uploadDocument(studentId, file, documentType),
    onSuccess: () => {
      // The upload returns only the new document, but the list needs every
      // document for this student — invalidating and refetching is simpler
      // than manually appending to a cache we didn't fully own.
      void queryClient.invalidateQueries({ queryKey: documentKeys.byStudent(studentId) })
    },
  })
}
