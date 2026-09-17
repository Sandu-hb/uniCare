import { useQuery } from '@tanstack/react-query'
import { searchMedicines } from './api'

export function useMedicines(search: string) {
  return useQuery({
    queryKey: ['medicines', search] as const,
    queryFn: () => searchMedicines(search),
    placeholderData: (previous) => previous,
  })
}
