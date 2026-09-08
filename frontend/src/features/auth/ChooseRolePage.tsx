import { Check, GraduationCap, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/routes'

export function ChooseRolePage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground flex flex-col justify-between items-center p-4 sm:p-6 lg:p-10 overflow-hidden">
      {/* Ambient background glow & subtle decorative mesh */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl" />
        <div className="absolute top-1/4 -left-32 size-[400px] rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute bottom-10 -right-32 size-[450px] rounded-full bg-teal-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1080px] flex-1 flex flex-col justify-between">
        {/* Top Header Navigation Bar */}
        <header className="flex items-center justify-between gap-4 py-4 px-6 rounded-2xl bg-card/80 border border-border/70 backdrop-blur-md shadow-sm mb-8">
          {/* Left Branding */}
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

          {/* Right Sign In Button (no arrow) */}
          <Button
            asChild
            className="rounded-full bg-primary text-primary-foreground font-semibold text-xs px-4 py-1.5 shadow-sm hover:bg-primary/90 transition-all"
          >
            <Link to={ROUTES.login}>Sign In</Link>
          </Button>
        </header>

        {/* Hero Title Block */}
        <div className="mt-2 text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-semibold text-primary mb-4 backdrop-blur-sm">
            <Sparkles className="size-3.5 text-primary" />
            <span>Select Account Portal</span>
          </div>

          <h1 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl lg:text-5xl leading-tight">
            Choose Your Path.
          </h1>
          <p className="mt-3 text-xs sm:text-sm font-medium text-muted-foreground leading-relaxed">
            Pick the account type that fits how you use the university medical centre.
          </p>
        </div>

        {/* Two Modern Interactive Role Option Cards */}
        <div className="my-8 grid gap-6 md:grid-cols-2">
          {/* Card 1: Student Account */}
          <div className="group relative flex flex-col justify-between rounded-3xl bg-card/90 backdrop-blur-md p-7 sm:p-8 shadow-lg hover:shadow-2xl border border-border/80 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="size-6" />
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/80 px-3 py-1 text-[11px] font-semibold text-muted-foreground border border-border/50">
                  <span className="size-1.5 rounded-full bg-primary" />
                  For Undergraduates
                </span>
              </div>

              <h2 className="mt-6 text-2xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                Student account
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Register with the medical centre and manage your own care from anywhere on campus.
              </p>

              {/* Feature Checklist */}
              <ul className="mt-6 flex flex-col gap-3">
                <li className="flex items-center gap-3 text-xs sm:text-sm font-medium text-foreground">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Check className="size-3.5 stroke-[3]" />
                  </div>
                  <span>Complete your medical registration online</span>
                </li>
                <li className="flex items-center gap-3 text-xs sm:text-sm font-medium text-foreground">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Check className="size-3.5 stroke-[3]" />
                  </div>
                  <span>Upload hospital reports and let extraction fill the form</span>
                </li>
                <li className="flex items-center gap-3 text-xs sm:text-sm font-medium text-foreground">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Check className="size-3.5 stroke-[3]" />
                  </div>
                  <span>Book appointments and watch your place in the queue</span>
                </li>
                <li className="flex items-center gap-3 text-xs sm:text-sm font-medium text-foreground">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Check className="size-3.5 stroke-[3]" />
                  </div>
                  <span>View prescriptions, lab results and medical reports</span>
                </li>
              </ul>
            </div>

            {/* Join Button without arrow icon */}
            <Button
              asChild
              className="mt-8 h-12 w-full rounded-2xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm shadow-md hover:bg-primary/90 hover:shadow-lg transition-all"
            >
              <Link to={ROUTES.registerStudent}>Join as a student</Link>
            </Button>
          </div>

          {/* Card 2: Staff Account */}
          <div className="group relative flex flex-col justify-between rounded-3xl bg-card/90 backdrop-blur-md p-7 sm:p-8 shadow-lg hover:shadow-2xl border border-border/80 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <Stethoscope className="size-6" />
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/80 px-3 py-1 text-[11px] font-semibold text-muted-foreground border border-border/50">
                  <ShieldCheck className="size-3.5 text-primary" />
                  For Admin & Healthcare Staff
                </span>
              </div>

              <h2 className="mt-6 text-2xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                Staff account
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                For doctors, nurses, dentists, pharmacy, laboratory and administrative staff.
              </p>

              {/* Feature Checklist */}
              <ul className="mt-6 flex flex-col gap-3">
                <li className="flex items-center gap-3 text-xs sm:text-sm font-medium text-foreground">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Check className="size-3.5 stroke-[3]" />
                  </div>
                  <span>Verify student medical records and uploaded documents</span>
                </li>
                <li className="flex items-center gap-3 text-xs sm:text-sm font-medium text-foreground">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Check className="size-3.5 stroke-[3]" />
                  </div>
                  <span>Record consultations, vital signs and diagnoses</span>
                </li>
                <li className="flex items-center gap-3 text-xs sm:text-sm font-medium text-foreground">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Check className="size-3.5 stroke-[3]" />
                  </div>
                  <span>Issue digital prescriptions and medical reports</span>
                </li>
                <li className="flex items-center gap-3 text-xs sm:text-sm font-medium text-foreground">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Check className="size-3.5 stroke-[3]" />
                  </div>
                  <span>Manage appointments, queues and pharmacy stock</span>
                </li>
              </ul>
            </div>

            {/* Join Button without arrow icon */}
            <Button
              asChild
              variant="outline"
              className="mt-8 h-12 w-full rounded-2xl border-2 border-primary/80 text-foreground font-semibold text-xs sm:text-sm hover:bg-primary/10 hover:border-primary transition-all"
            >
              <Link to={ROUTES.registerStaff}>Join as a staff member</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
