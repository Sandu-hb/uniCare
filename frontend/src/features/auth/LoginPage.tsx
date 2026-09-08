import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, Lock, Mail, Quote } from 'lucide-react'
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
    <div className="mx-auto w-full max-w-[940px] overflow-hidden rounded-[28px] bg-white shadow-2xl md:grid md:grid-cols-12">
      {/* Left panel with doctor photo, gradient overlay, curved divider & quote */}
      <div className="relative hidden overflow-hidden bg-[#16242e] md:col-span-5 md:flex md:flex-col md:justify-between md:p-10 min-h-[580px]">
        {/* Background Image */}
        <img
          src="/doctor-bg.jpg"
          alt="University Medical Centre Doctor"
          className="absolute inset-0 size-full object-cover object-top"
          onError={(e) => {
            // Fallback if image path differs
            e.currentTarget.style.opacity = '0.3'
          }}
        />

        {/* Dark Teal/Navy Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e171e]/95 via-[#13222e]/60 to-[#13222e]/40" />

        {/* Smooth Curved White Separator SVG on the right boundary */}
        <svg
          className="absolute -right-px top-0 h-full w-14 text-white pointer-events-none z-10 hidden md:block"
          viewBox="0 0 100 1000"
          preserveAspectRatio="none"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M 100 0 C 12 350 12 650 100 1000 L 100 0 Z" />
        </svg>

        {/* Top Branding Pill */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-md">
            <span className="size-2 rounded-full bg-cyan-400 animate-pulse" />
            UniCare Portal
          </div>
        </div>

        {/* Bottom Headline & Quote */}
        <div className="relative z-10 pb-4">
          <div className="mb-4 text-cyan-400">
            <Quote className="size-8 rotate-180 opacity-90" />
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase leading-[1.12]">
            Better care
            <br />
            starts with
            <br />
            better records
          </h2>

          <p className="mt-4 text-xs font-normal leading-relaxed text-slate-300/90 max-w-xs">
            One secure record for every visit, prescription and lab result at the university medical centre.
          </p>
        </div>
      </div>

      {/* Right panel: Sign-in form */}
      <div className="flex flex-col justify-center px-8 py-10 sm:px-12 md:col-span-7 md:px-12 md:py-14">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-2 text-xs font-medium text-slate-500">
            Sign in with your university email to access clinical records.
          </p>
        </div>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 flex flex-col gap-5"
        >
          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              University Email
            </Label>
            <div className="relative">
              <Mail
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400"
              />
              <Input
                id="email"
                type="email"
                autoComplete="username"
                autoFocus
                placeholder="yourname@uom.lk"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className="h-12 rounded-xl border-0 bg-slate-100/80 pl-11 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-700"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p id="email-error" role="alert" className="text-xs font-medium text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Password
              </Label>
              <Link
                to={ROUTES.forgotPassword}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400"
              />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••••••"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                className="h-12 rounded-xl border-0 bg-slate-100/80 px-11 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-700"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute top-1/2 right-4 -translate-y-1/2 rounded-sm text-slate-400 outline-none hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" role="alert" className="text-xs font-medium text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {formError && (
            <div role="alert" className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100">
              {formError}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl bg-[#2a3c48] font-semibold text-white shadow-md hover:bg-[#1e2d36] active:scale-[0.99] transition-all mt-1"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" /> Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        {/* OR Divider */}
        <div className="relative my-7 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            OR
          </div>
        </div>

        {/* Create account link */}
        <p className="text-center text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <Link to={ROUTES.register} className="font-bold text-slate-900 underline hover:text-slate-700">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
