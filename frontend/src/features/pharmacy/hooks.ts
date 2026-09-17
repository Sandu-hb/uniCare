import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { visitKeys } from '@/features/visits/hooks'
import { dispensePrescription, getPrescription } from './api'

export const prescriptionKeys = {
  all: ['pharmacy-prescriptions'] as const,
  byVisit: (visitId: string) => [...prescriptionKeys.all, visitId] as const,
}

/** Off by default — only the open dialog fetches. */
export function usePrescription(visitId: string, enabled = false) {
  return useQuery({
    queryKey: prescriptionKeys.byVisit(visitId),
    queryFn: () => getPrescription(visitId),
    enabled: enabled && Boolean(visitId),
  })
}

export function useDispensePrescription(visitId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => dispensePrescription(visitId),
    onSuccess: (prescription) => {
      queryClient.setQueryData(prescriptionKeys.byVisit(visitId), prescription)
      // The visit just completed.
      void queryClient.invalidateQueries({ queryKey: visitKeys.all })
    },
  })
}
