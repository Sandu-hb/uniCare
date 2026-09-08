import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/auth-context'

interface DashboardPlaceholderProps {
  title: string
}

/** Stands in for the real dashboard until each area's pages are built. */
export function DashboardPlaceholder({ title }: DashboardPlaceholderProps) {
  const { user, logout } = useAuth()

  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm text-muted-foreground">
        Signed in as {user?.fullName} ({user?.email})
      </p>
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      <Button variant="outline" onClick={() => void logout()}>
        Sign out
      </Button>
    </div>
  )
}
