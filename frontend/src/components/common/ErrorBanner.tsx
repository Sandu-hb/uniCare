import { CircleAlert } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getApiErrorMessage } from '@/lib/api-client'

interface ErrorBannerProps {
  error: unknown
  className?: string
}

/**
 * The inline `bg-destructive/10` error message repeated across most pages
 * that fetch or mutate data, now backed by the shared Alert primitive.
 */
export function ErrorBanner({ error, className }: ErrorBannerProps) {
  return (
    <Alert variant="destructive" className={`mb-4 ${className ?? ''}`}>
      <CircleAlert />
      <AlertDescription>{getApiErrorMessage(error)}</AlertDescription>
    </Alert>
  )
}
