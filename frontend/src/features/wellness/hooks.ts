import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getFlaggedSessionDetail, getFlaggedSessions, getOwnSessionDetail, getOwnSessions,
  sendMessage, startOrResumeSession,
} from './api'

export const wellnessKeys = {
  ownSessions: ['wellness', 'sessions'] as const,
  ownSessionDetail: (sessionId: string) => ['wellness', 'sessions', sessionId] as const,
  flaggedSessions: ['wellness', 'alerts'] as const,
  flaggedSessionDetail: (sessionId: string) => ['wellness', 'alerts', sessionId] as const,
}

export function useStartOrResumeSession() {
  return useMutation({ mutationFn: startOrResumeSession })
}

export function useSendCounselingMessage(sessionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => sendMessage(sessionId, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: wellnessKeys.ownSessions })
    },
  })
}

export function useOwnSessions() {
  return useQuery({ queryKey: wellnessKeys.ownSessions, queryFn: getOwnSessions })
}

export function useOwnSessionDetail(sessionId: string) {
  return useQuery({
    queryKey: wellnessKeys.ownSessionDetail(sessionId),
    queryFn: () => getOwnSessionDetail(sessionId),
    enabled: Boolean(sessionId),
  })
}

export function useFlaggedSessions() {
  return useQuery({ queryKey: wellnessKeys.flaggedSessions, queryFn: getFlaggedSessions })
}

export function useFlaggedSessionDetail(sessionId: string) {
  return useQuery({
    queryKey: wellnessKeys.flaggedSessionDetail(sessionId),
    queryFn: () => getFlaggedSessionDetail(sessionId),
    enabled: Boolean(sessionId),
  })
}
