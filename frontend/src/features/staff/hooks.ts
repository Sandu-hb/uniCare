import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  activateStaff, createStaff, resendStaffCredentials, searchStaff, suspendStaff,
  type SearchStaffParams,
} from './api'
import type { CreateStaffRequest } from './types'

export const staffKeys = {
  all: ['staff'] as const,
  list: (params: SearchStaffParams) => [...staffKeys.all, 'list', params] as const,
}

export function useStaffAccounts(params: SearchStaffParams) {
  return useQuery({
    queryKey: staffKeys.list(params),
    queryFn: () => searchStaff(params),
    placeholderData: (previous) => previous,
  })
}

export function useCreateStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateStaffRequest) => createStaff(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: staffKeys.all })
    },
  })
}

function useAccountMutation(fn: (id: string) => ReturnType<typeof activateStaff>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: staffKeys.all })
    },
  })
}

export function useActivateStaff() {
  return useAccountMutation(activateStaff)
}

export function useSuspendStaff() {
  return useAccountMutation(suspendStaff)
}

export function useResendStaffCredentials() {
  return useAccountMutation(resendStaffCredentials)
}
