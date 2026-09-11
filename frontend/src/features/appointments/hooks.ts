import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  approveAppointment, assignAppointmentStaff, cancelAppointment, createAppointment,
  getAssignableStaff, getForStudent, rejectAppointment, searchAppointments,
  type SearchAppointmentsParams,
} from './api'
import type { CreateAppointmentRequest } from './types'

export const appointmentKeys = {
  all: ['appointments'] as const,
  byStudent: (studentId: string) => [...appointmentKeys.all, 'student', studentId] as const,
  queue: (params: SearchAppointmentsParams) => [...appointmentKeys.all, 'queue', params] as const,
  assignableStaff: ['appointments', 'assignable-staff'] as const,
}

export function useMyAppointments(studentId: string) {
  return useQuery({
    queryKey: appointmentKeys.byStudent(studentId),
    queryFn: () => getForStudent(studentId),
    enabled: Boolean(studentId),
  })
}

export function useCreateAppointment(studentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateAppointmentRequest) => createAppointment(studentId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.byStudent(studentId) })
    },
  })
}

/** Shared by both the student and staff cancel actions — same endpoint either way. */
export function useCancelAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => cancelAppointment(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
    },
  })
}

export function useAppointmentQueue(params: SearchAppointmentsParams) {
  return useQuery({
    queryKey: appointmentKeys.queue(params),
    queryFn: () => searchAppointments(params),
    placeholderData: (previous) => previous,
  })
}

export function useAssignableStaff() {
  return useQuery({
    queryKey: appointmentKeys.assignableStaff,
    queryFn: getAssignableStaff,
  })
}

/**
 * Approve/reject/assign all mutate one appointment in the staff queue — same
 * invalidation, different call. One helper instead of three near-identical hooks.
 */
function useQueueMutation<TArgs>(fn: (args: TArgs) => ReturnType<typeof approveAppointment>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
    },
  })
}

export function useApproveAppointment() {
  return useQueueMutation(({ id, assignedStaffId }: { id: string; assignedStaffId?: string | null }) =>
    approveAppointment(id, assignedStaffId))
}

export function useRejectAppointment() {
  return useQueueMutation(({ id, reason }: { id: string; reason: string }) =>
    rejectAppointment(id, reason))
}

export function useAssignAppointmentStaff() {
  return useQueueMutation(({ id, staffId }: { id: string; staffId: string }) =>
    assignAppointmentStaff(id, staffId))
}
