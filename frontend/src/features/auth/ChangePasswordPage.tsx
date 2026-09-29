import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, KeyRound, Loader2, Lock } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { dashboardFor } from '@/config/routes'
import { getApiErrorMessage } from '@/lib/api-client'
import { useAuth } from './auth-context'
import { changePasswordSchema, type ChangePasswordFormValues } from './validation'

const FIELDS = [
  { name: 'currentPassword', label: 'Current (temporary) password', autoComplete: 'current-password' },
  { name: 'newPassword', label: 'New password', autoComplete: 'new-password' },
  { name: 'confirmPassword', label: 'Confirm new password', autoComplete: 'new-password' },
] as const

/**
 * Forced first stop for an admin-created (or admin-reset) staff account — its
 * temporary password must be replaced before reaching any dashboard. Guarded
 * into the route tree by ProtectedRoute, which checks user.mustChangePassword.
 */
export function ChangePasswordPage() {
  const { user, changePassword } = useAuth()
  const navigate = useNavigate()
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  })

  async function onSubmit(values: ChangePasswordFormValues) {
    setFormError(null)
    try {
      const updatedUser = await changePassword(values.currentPassword, values.newPassword)
      navigate(dashboardFor(updatedUser.roles), { replace: true })
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Could not change your password. Try again.'))
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-md">
        <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-accent text-primary">
          <KeyRound className="size-5" />
        </div>
        <h1 className="mt-4 text-center text-xl font-bold text-foreground">Set a new password</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {user ? `Welcome, ${user.fullName}. ` : ''}
          For security, you must replace your temporary password before continuing.
        </p>

        <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
          {FIELDS.map(({ name, label, autoComplete }) => (
            <div key={name} className="flex flex-col gap-1.5">
              <Label htmlFor={name} className="text-[11px] font-bold uppercase tracking-wider text-foreground/80">
                {label}
              </Label>
              <div className="relative">
                <Lock
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id={name}
                  type={visible[name] ? 'text' : 'password'}
                  autoComplete={autoComplete}
                  aria-invalid={!!errors[name]}
                  aria-describedby={errors[name] ? `${name}-error` : undefined}
                  className="h-11 rounded-xl border-0 bg-muted pl-10 pr-10 text-sm font-medium text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  {...register(name)}
                />
                <button
                  type="button"
                  onClick={() => setVisible((v) => ({ ...v, [name]: !v[name] }))}
                  aria-label={visible[name] ? 'Hide password' : 'Show password'}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {visible[name] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors[name] && (
                <p id={`${name}-error`} role="alert" className="text-xs font-medium text-destructive">
                  {errors[name]?.message}
                </p>
              )}
            </div>
          ))}

          {formError && (
            <div role="alert" className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive border border-destructive/20">
              {formError}
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="mt-1 h-11 w-full rounded-xl font-semibold">
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" /> Updating…
              </span>
            ) : (
              'Update password'
            )}
          </Button>
        </form>
      </div>
    </main>
  )
}
