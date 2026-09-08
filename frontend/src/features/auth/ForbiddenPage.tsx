import { ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { dashboardFor } from '@/config/routes'
import { useAuth } from './auth-context'

export function ForbiddenPage() {
  const { user } = useAuth()

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <ShieldAlert className="size-5" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-foreground">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account doesn&apos;t have permission to view that page.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link to={user ? dashboardFor(user.roles) : '/login'}>Back to your dashboard</Link>
        </Button>
      </div>
    </main>
  )
}
