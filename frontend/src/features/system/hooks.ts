import { useQuery } from '@tanstack/react-query'
import { getHealth } from './api'

/**
 * Reference pattern for every feature: an api.ts with the raw call, and a hooks.ts
 * wrapping it in useQuery. Components never call axios directly.
 */
export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
  })
}
