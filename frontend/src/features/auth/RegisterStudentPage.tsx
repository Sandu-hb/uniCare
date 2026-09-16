import { zodResolver } from '@hookform/resolvers/zod'
import {
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ROUTES } from '@/config/routes'
import { useAuth } from '@/features/auth/auth-context'
import { useRegisterStudent } from '@/features/students/hooks'
import { GENDERS } from '@/features/students/types'
import { getApiErrorMessage } from '@/lib/api-client'
import { registerStudentSchema, UNIVERSITY_DOMAIN, type RegisterStudentFormValues } from './validation'

export function RegisterStudentPage() {
  const navigate = useNavigate()
  const { establishSession } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const registerStudent = useRegisterStudent()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterStudentFormValues>({
    resolver: zodResolver(registerStudentSchema),
    defaultValues: { gender: 'Male', academicYear: 1 },
  })

  function onSubmit(values: RegisterStudentFormValues) {
    registerStudent.mutate(
      {
        registrationNumber: values.registrationNumber,
        fullName: values.fullName,
        dateOfBirth: values.dateOfBirth,
        gender: values.gender,
        faculty: values.faculty,
        department: values.department,
        academicYear: values.academicYear,
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: (response) => {
          establishSession(response)
          toast.success('Account created — upload your medical report and university ID to get started.')
          navigate(ROUTES.student.dashboard, { replace: true })
        },
        // A duplicate registration number/email lands here as a 409.
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <main className="relative min-h-screen bg-background text-foreground flex flex-col items-center p-4 sm:p-6 lg:p-10 overflow-hidden">
      {/* Ambient background glow, matching the role-selection page */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl" />
        <div className="absolute top-1/4 -left-32 size-[400px] rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute bottom-10 -right-32 size-[450px] rounded-full bg-teal-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1080px]">
        {/* Top header navigation bar */}
        <header className="flex items-center justify-between gap-4 py-4 px-6 rounded-2xl bg-card/80 border border-border/70 backdrop-blur-md shadow-sm mb-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-md">
              <GraduationCap className="size-6" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-lg font-extrabold text-foreground tracking-tight">UniCare</div>
              <div className="text-[11px] font-medium text-muted-foreground tracking-wide">
                University Student Health Portal
              </div>
            </div>
          </div>

          <Button
            asChild
            className="rounded-full bg-primary text-primary-foreground font-semibold text-xs px-4 py-1.5 shadow-sm hover:bg-primary/90 transition-all"
          >
            <Link to={ROUTES.login}>Sign In</Link>
          </Button>
        </header>

        <div className="mx-auto w-full max-w-[560px]">
          {/* Back link */}
          <div className="flex justify-center">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-semibold text-primary backdrop-blur-sm transition-colors hover:bg-primary/15"
            >
              <Sparkles className="size-3.5 text-primary" />
              Student Registration Portal
            </div>
          </div>

          {/* Hero title block */}
          <div className="mt-4 text-center">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl leading-tight">
              Create your UniCare Account.
            </h1>
            <p className="mt-3 text-xs sm:text-sm font-medium text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Connect with your campus health team. Enter your university credentials below to get
              started.
            </p>
          </div>

          {/* Form card */}
          <div className="mt-8 rounded-3xl bg-card p-7 sm:p-8 shadow-lg border border-border/80">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
              <GraduationCap className="size-7" />
            </div>

            <h2 className="mt-4 text-center text-lg font-bold text-foreground tracking-tight">
              Student Account Setup
            </h2>
            <p className="mt-0 text-center text-xs sm:text-sm text-muted-foreground">
              Please fill out your verified campus details.
            </p>

            <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-5">
              {/* Registration number & full name */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="registrationNumber" className="text-[11px] font-bold uppercase tracking-wider text-foreground/80">
                    Registration Number
                  </Label>
                  <Input
                    id="registrationNumber"
                    autoFocus
                    placeholder="2023/CS/045"
                    aria-invalid={!!errors.registrationNumber}
                    className="h-12 rounded-xl border-0 bg-muted px-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    {...register('registrationNumber')}
                  />
                  {errors.registrationNumber && (
                    <p role="alert" className="text-xs font-medium text-destructive">
                      {errors.registrationNumber.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fullName" className="text-[11px] font-bold uppercase tracking-wider text-foreground/80">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    aria-invalid={!!errors.fullName}
                    className="h-12 rounded-xl border-0 bg-muted px-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    {...register('fullName')}
                  />
                  {errors.fullName && (
                    <p role="alert" className="text-xs font-medium text-destructive">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Date of birth & gender */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="dateOfBirth" className="text-[11px] font-bold uppercase tracking-wider text-foreground/80">
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    aria-invalid={!!errors.dateOfBirth}
                    className="h-12 rounded-xl border-0 bg-muted px-4 text-sm font-medium text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    {...register('dateOfBirth')}
                  />
                  {errors.dateOfBirth && (
                    <p role="alert" className="text-xs font-medium text-destructive">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="gender" className="text-[11px] font-bold uppercase tracking-wider text-foreground/80">
                    Gender
                  </Label>
                  <select
                    id="gender"
                    className="h-12 rounded-xl border-0 bg-muted px-4 text-sm font-medium text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register('gender')}
                  >
                    {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              {/* Faculty & department */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="faculty" className="text-[11px] font-bold uppercase tracking-wider text-foreground/80">
                    Faculty
                  </Label>
                  <Input
                    id="faculty"
                    aria-invalid={!!errors.faculty}
                    className="h-12 rounded-xl border-0 bg-muted px-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    {...register('faculty')}
                  />
                  {errors.faculty && (
                    <p role="alert" className="text-xs font-medium text-destructive">
                      {errors.faculty.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="department" className="text-[11px] font-bold uppercase tracking-wider text-foreground/80">
                    Department
                  </Label>
                  <Input
                    id="department"
                    aria-invalid={!!errors.department}
                    className="h-12 rounded-xl border-0 bg-muted px-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    {...register('department')}
                  />
                  {errors.department && (
                    <p role="alert" className="text-xs font-medium text-destructive">
                      {errors.department.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Academic year */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="academicYear" className="text-[11px] font-bold uppercase tracking-wider text-foreground/80">
                  Academic Year
                </Label>
                <Input
                  id="academicYear"
                  type="number"
                  min={1}
                  max={6}
                  aria-invalid={!!errors.academicYear}
                  className="h-12 rounded-xl border-0 bg-muted px-4 text-sm font-medium text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  {...register('academicYear', { valueAsNumber: true })}
                />
                {errors.academicYear && (
                  <p role="alert" className="text-xs font-medium text-destructive">
                    {errors.academicYear.message}
                  </p>
                )}
              </div>

              {/* University email */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="email"
                  className="text-[11px] font-bold uppercase tracking-wider text-foreground/80"
                >
                  University Email
                </Label>
                <div className="relative">
                  <Mail
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder={`email@${UNIVERSITY_DOMAIN}`}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : 'email-hint'}
                    className="h-12 rounded-xl border-0 bg-muted pl-11 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    {...register('email')}
                  />
                </div>
                {errors.email ? (
                  <p id="email-error" role="alert" className="text-xs font-medium text-destructive">
                    {errors.email.message}
                  </p>
                ) : (
                  <p id="email-hint" className="text-xs text-muted-foreground">
                    Institutional emails must end with @{UNIVERSITY_DOMAIN}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="password"
                  className="text-[11px] font-bold uppercase tracking-wider text-foreground/80"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Enter your password"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    className="h-12 rounded-xl border-0 bg-muted px-11 text-sm font-medium text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
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
                  <p id="password-error" role="alert" className="text-xs font-medium text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Re-enter password */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="confirmPassword"
                  className="text-[11px] font-bold uppercase tracking-wider text-foreground/80"
                >
                  Re-enter Password
                </Label>
                <div className="relative">
                  <Lock
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                    className="h-12 rounded-xl border-0 bg-muted px-11 text-sm font-medium text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute top-1/2 right-4 -translate-y-1/2 rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p
                    id="confirm-password-error"
                    role="alert"
                    className="text-xs font-medium text-destructive"
                  >
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={registerStudent.isPending}
                className="h-12 w-full rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/90 active:scale-[0.99] transition-all mt-1"
              >
                {registerStudent.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" /> Creating account...
                  </span>
                ) : (
                  'Continue'
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Already registered?{' '}
              <Link to={ROUTES.login} className="font-bold text-foreground underline hover:text-primary">
                Sign in to your account
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            Secured via University of Moratuwa Health Information Registry
          </p>
        </div>
      </div>
    </main>
  )
}
