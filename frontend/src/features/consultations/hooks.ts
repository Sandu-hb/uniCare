import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { visitKeys } from '@/features/visits/hooks'
import { getConsultation, upsertConsultation } from './api'
import type { UpsertConsultationRequest } from './types'

export const consultationKeys = {
  all: ['consultations'] as const,
  byVisit: (visitId: string) => [...consultationKeys.all, visitId] as const,
}

/** Off by default — only the open dialog fetches. See useVitalSign for the same reasoning. */
export function useConsultation(visitId: string, enabled = false) {
  return useQuery({
    queryKey: consultationKeys.byVisit(visitId),
    queryFn: () => getConsultation(visitId),
    enabled: enabled && Boolean(visitId),
  })
}

export function useUpsertConsultation(visitId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: UpsertConsultationRequest) => upsertConsultation(visitId, request),
    onSuccess: (consultation) => {
      queryClient.setQueryData(consultationKeys.byVisit(visitId), consultation)
      // hasConsultation just flipped, which is what unlocks Complete.
      void queryClient.invalidateQueries({ queryKey: visitKeys.all })
    },
  })
}
