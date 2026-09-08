import { Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/routes'
import { useAuth } from './auth-context'

/** Staff sign-up is not self-service — an admin has to approve the account first. */
export function PendingApprovalPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await logout()
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-accent text-primary">
          <Clock className="size-5" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-foreground">Waiting for approval</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {user
            ? `${user.email} is registered but hasn't been approved by an administrator yet.`
            : 'This account has not been approved by an administrator yet.'}{' '}
          You&apos;ll be able to sign in once that happens.
        </p>
        <Button variant="outline" className="mt-6 w-full" onClick={() => void handleSignOut()}>
          Sign out
        </Button>
      </div>
    </main>
  )
}
