import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { visitKeys } from '@/features/visits/hooks'
import { completeLabOrder, getLabOrder } from './api'
import type { CompleteLabOrderRequest } from './types'

export const labOrderKeys = {
  all: ['lab-orders'] as const,
  byVisit: (visitId: string) => [...labOrderKeys.all, visitId] as const,
}

/** Off by default — only the open dialog fetches. */
export function useLabOrder(visitId: string, enabled = false) {
  return useQuery({
    queryKey: labOrderKeys.byVisit(visitId),
    queryFn: () => getLabOrder(visitId),
    enabled: enabled && Boolean(visitId),
  })
}

export function useCompleteLabOrder(visitId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CompleteLabOrderRequest) => completeLabOrder(visitId, request),
    onSuccess: (order) => {
      queryClient.setQueryData(labOrderKeys.byVisit(visitId), order)
      // The visit just routed onward (to Pharmacy or Completed).
      void queryClient.invalidateQueries({ queryKey: visitKeys.all })
    },
  })
}
