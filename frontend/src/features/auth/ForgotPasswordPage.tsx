import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'

export function ForgotPasswordPage() {
  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl bg-card p-8 text-center shadow-2xl">
      <h1 className="text-2xl font-extrabold text-foreground">Reset your password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Password reset isn&apos;t built yet — this is a placeholder for the next milestone.
      </p>
      <Link
        to={ROUTES.login}
        className="mt-6 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <ArrowLeft className="size-4" />
        Back to sign in
      </Link>
    </div>
  )
}
