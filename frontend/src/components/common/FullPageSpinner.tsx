import { Loader2 } from 'lucide-react'

/** Shown while AuthProvider is still checking a restored session. */
export function FullPageSpinner() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Loading" />
    </div>
  )
}
