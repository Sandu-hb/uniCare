import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { abandonVisit, callVisit, checkIn, getQueue } from './api'
import type { CheckInRequest, QueueStage } from './types'

export const visitKeys = {
  all: ['visits'] as const,
  queue: (stage: QueueStage) => [...visitKeys.all, 'queue', stage] as const,
}

export function useQueue(stage: QueueStage) {
  return useQuery({
    queryKey: visitKeys.queue(stage),
    queryFn: () => getQueue(stage),
    // The queue changes on its own as staff work through it — a short poll
    // keeps the board current without the user having to refresh.
    refetchInterval: 15_000,
  })
}

export function useCheckIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ studentId, request }: { studentId: string; request: CheckInRequest }) =>
      checkIn(studentId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: visitKeys.all })
    },
  })
}

function useVisitMutation(fn: (id: string) => ReturnType<typeof callVisit>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: visitKeys.all })
    },
  })
}

export function useCallVisit() {
  return useVisitMutation(callVisit)
}

export function useAbandonVisit() {
  return useVisitMutation(abandonVisit)
}
