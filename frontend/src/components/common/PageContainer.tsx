import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const SIZES = {
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
  xl: 'max-w-5xl',
} as const

interface PageContainerProps {
  size?: keyof typeof SIZES
  className?: string
  children: ReactNode
}

/**
 * Consolidates the three max-width wrapper conventions (max-w-3xl for
 * single-entity/form pages, max-w-4xl for queue boards, max-w-5xl for
 * list/dashboard pages) that were previously copy-pasted per page.
 */
export function PageContainer({ size = 'xl', className, children }: PageContainerProps) {
  return <div className={cn('mx-auto p-6', SIZES[size], className)}>{children}</div>
}
