import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  assignAppointmentStaff, cancelAppointment, createAppointment,
  getAssignableStaff, getForStudent, getMyStaffAppointments, searchAppointments,
  type SearchAppointmentsParams,
} from './api'
import type { CreateAppointmentRequest } from './types'

export const appointmentKeys = {
  all: ['appointments'] as const,
  byStudent: (studentId: string) => [...appointmentKeys.all, 'student', studentId] as const,
  mine: ['appointments', 'mine'] as const,
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

export function useMyStaffAppointments() {
  return useQuery({
    queryKey: appointmentKeys.mine,
    queryFn: getMyStaffAppointments,
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

/** Staff-only cancel action. */
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

export function useAssignAppointmentStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, staffId }: { id: string; staffId: string }) => assignAppointmentStaff(id, staffId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
    },
  })
}
