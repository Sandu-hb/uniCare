import { ArrowLeft, Check, GraduationCap, Stethoscope } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/routes'

interface RoleCard {
  icon: typeof GraduationCap
  title: string
  description: string
  features: string[]
  to: string
  cta: string
}

const roleCards: RoleCard[] = [
  {
    icon: GraduationCap,
    title: 'Student account',
    description: 'Register with the medical centre and manage your own care from anywhere on campus.',
    features: [
      'Complete your medical registration online',
      'Upload hospital reports and let extraction fill the form',
      'Book appointments and watch your place in the queue',
      'View prescriptions, lab results and medical reports',
    ],
    to: ROUTES.registerStudent,
    cta: 'Join as a student',
  },
  {
    icon: Stethoscope,
    title: 'Staff account',
    description: 'For doctors, nurses, dentists, pharmacy, laboratory and administrative staff.',
    features: [
      'Verify student medical records and uploaded documents',
      'Record consultations, vital signs and diagnoses',
      'Issue digital prescriptions and medical reports',
      'Manage appointments, queues and pharmacy stock',
    ],
    to: ROUTES.registerStaff,
    cta: 'Join as a staff member',
  },
]

export function ChooseRolePage() {
  return (
    <main className="min-h-svh bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link
          to={ROUTES.login}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>

        <div className="mt-8 text-center">
          <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">Choose your path</h1>
          <p className="mt-3 text-muted-foreground">
            Pick the account type that fits how you use the university medical centre.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {roleCards.map(({ icon: Icon, title, description, features, to, cta }) => (
            <div
              key={title}
              className="flex flex-col rounded-2xl border border-border bg-card p-7 transition-colors hover:border-primary/40"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-accent text-primary">
                <Icon className="size-5" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-foreground">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>

              <ul className="mt-5 flex flex-col gap-2.5">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button asChild variant="outline" className="mt-7 h-11 rounded-full border-primary text-primary hover:bg-primary/10 hover:text-primary">
                <Link to={to}>{cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Accounts are limited to university email addresses. All access to medical records is
          logged.
        </p>
      </div>
    </main>
  )
}
