import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createStudent, getStudent, searchStudents, type SearchStudentsParams } from './api'
import type { CreateStudentRequest } from './types'

/**
 * Query keys in one place. Every key starts with 'students', so invalidating
 * that prefix refreshes every students query at once — list, search and detail.
 */
export const studentKeys = {
  all: ['students'] as const,
  list: (params: SearchStudentsParams) => [...studentKeys.all, 'list', params] as const,
  detail: (id: string) => [...studentKeys.all, 'detail', id] as const,
}

export function useStudents(params: SearchStudentsParams) {
  return useQuery({
    // params is part of the key, so typing in the search box refetches — and
    // going back to a previous term serves the cached result instantly.
    queryKey: studentKeys.list(params),
    queryFn: () => searchStudents(params),
    // Keeps the previous page visible while the next one loads, instead of
    // flashing an empty table on every keystroke.
    placeholderData: (previous) => previous,
  })
}

export function useStudent(id: string | undefined) {
  return useQuery({
    queryKey: studentKeys.detail(id!),
    queryFn: () => getStudent(id!),
    enabled: Boolean(id),   // don't fire until there is an id
  })
}

export function useCreateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateStudentRequest) => createStudent(request),
    onSuccess: () => {
      // The new student must appear in the list. Rather than manually inserting
      // it, mark every students query stale and let TanStack refetch.
      void queryClient.invalidateQueries({ queryKey: studentKeys.all })
    },
  })
}
