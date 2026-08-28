import { QueryClient } from '@tanstack/react-query'

/**
 * TanStack Query owns all server state: caching, loading and error flags,
 * background refetching and invalidation after mutations. Without it every
 * screen hand-rolls the same useState/useEffect plumbing.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Clinical data changes often enough that a long cache would mislead staff.
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
