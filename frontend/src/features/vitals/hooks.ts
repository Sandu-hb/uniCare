import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { visitKeys } from '@/features/visits/hooks'
import { getVitalSign, upsertVitalSign } from './api'
import type { UpsertVitalSignRequest } from './types'

export const vitalKeys = {
  all: ['vitals'] as const,
  byVisit: (visitId: string) => [...vitalKeys.all, visitId] as const,
}

/**
 * enabled is off by default: the queue renders one dialog per row, and they
 * should not all fetch in the background — only the open one does.
 */
export function useVitalSign(visitId: string, enabled = false) {
  return useQuery({
    queryKey: vitalKeys.byVisit(visitId),
    queryFn: () => getVitalSign(visitId),
    enabled: enabled && Boolean(visitId),
  })
}

export function useUpsertVitalSign(visitId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: UpsertVitalSignRequest) => upsertVitalSign(visitId, request),
    onSuccess: (vital) => {
      queryClient.setQueryData(vitalKeys.byVisit(visitId), vital)
      // The queue's hasVitalSign flag just changed, which is what unlocks Advance.
      void queryClient.invalidateQueries({ queryKey: visitKeys.all })
    },
  })
}
