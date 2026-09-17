import { useQuery } from '@tanstack/react-query'
import { getVisitHistory } from './api'

export const visitHistoryKeys = {
  byStudent: (studentId: string) => ['visit-history', studentId] as const,
}

export function useVisitHistory(studentId: string) {
  return useQuery({
    queryKey: visitHistoryKeys.byStudent(studentId),
    queryFn: () => getVisitHistory(studentId),
    enabled: Boolean(studentId),
  })
}
