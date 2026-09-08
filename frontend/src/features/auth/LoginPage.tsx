import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate, type Location } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { dashboardFor, ROUTES } from '@/config/routes'
import { useAuth } from './auth-context'
import { AuthApiError } from './mock-api'
import { loginSchema, type LoginFormValues } from './validation'

/** UOM_LK doesn't confirm which addresses are registered — one message either way. */
const INVALID_CREDENTIALS_MESSAGE = 'Email or password is incorrect.'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: LoginFormValues) {
    setFormError(null)
    try {
      const user = await login(values.email, values.password)
      if (user.status === 'PendingApproval') {
        navigate(ROUTES.pendingApproval, { replace: true })
        return
      }
      const from = (location.state as { from?: Location } | null)?.from
      navigate(from ?? dashboardFor(user.roles), { replace: true })
    } catch (error) {
      setFormError(error instanceof AuthApiError ? error.message : INVALID_CREDENTIALS_MESSAGE)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl bg-card shadow-2xl md:grid md:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-primary md:flex md:flex-col md:justify-end">
        <img
          src="/auth-panel.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
        />
        <div aria-hidden className="absolute inset-0 overflow-hidden opacity-[0.08]">
          <div className="absolute top-10 left-8 size-16 rotate-12 rounded-xl bg-white" />
          <div className="absolute top-40 right-12 size-10 -rotate-6 rounded-lg bg-white" />
          <div className="absolute bottom-56 left-16 size-12 rotate-45 rounded-lg bg-white" />
          <div className="absolute bottom-24 right-20 size-20 -rotate-12 rounded-xl bg-white" />
          <div className="absolute top-1/2 left-1/3 size-8 rotate-6 rounded-md bg-white" />
        </div>
        <div className="absolute inset-0 bg-primary/55" />
        <div className="relative z-10 p-10 text-white">
          <p className="text-3xl font-extrabold leading-[1.15] uppercase">
            Better care
            <br />
            starts with better
            <br />
            records
          </p>
          <p className="mt-4 text-sm text-white/70">
            One secure record for every visit, prescription and lab result at the university
            medical centre.
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center px-7 py-10 lg:px-12">
        <h1 className="text-3xl font-extrabold text-foreground">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in with your university email.</p>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">University email</Label>
            <div className="relative">
              <Mail
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="email"
                type="email"
                autoComplete="username"
                autoFocus
                placeholder="yourname@uom.lk"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className="h-11 rounded-full bg-muted/60 pl-11"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p id="email-error" role="alert" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to={ROUTES.forgotPassword}
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                className="h-11 rounded-full bg-muted/60 px-11"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute top-1/2 right-4 -translate-y-1/2 rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" role="alert" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {formError && (
            <p role="alert" className="text-sm text-destructive">
              {formError}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 rounded-full"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Sign in
          </Button>

          {/* Social sign-in (Google / Microsoft) goes here once university SSO is wired up. */}
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link to={ROUTES.register} className="font-medium text-primary underline-offset-4 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
