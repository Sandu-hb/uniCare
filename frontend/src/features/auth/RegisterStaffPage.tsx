import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'

/** Placeholder — the staff registration form is a separate task. */
export function RegisterStaffPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center">
        <h1 className="text-xl font-bold text-foreground">Staff registration</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The registration form is coming next. This route is wired up so it can be built without
          touching navigation again.
        </p>
        <Link
          to={ROUTES.register}
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          Choose a different account type
        </Link>
      </div>
    </main>
  )
}
