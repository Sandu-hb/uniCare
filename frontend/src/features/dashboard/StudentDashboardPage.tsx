import { CalendarDays, CheckCircle2, Circle, FileText, Pill } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import { useMyAppointments } from '@/features/appointments/hooks'
import { OPEN_STATUSES } from '@/features/appointments/types'
import { useAuth } from '@/features/auth/auth-context'
import { useMedicalProfile } from '@/features/medical-profiles/hooks'
import { STATUS_LABELS } from '@/features/medical-profiles/types'
import { useMyStudent } from '@/features/students/hooks'

function todayGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function StudentDashboardPage() {
  const { user } = useAuth()
  const { data: student } = useMyStudent()
  const studentId = student?.id ?? ''

  const { data: appointments } = useMyAppointments(studentId)
  const { data: profile } = useMedicalProfile(studentId)

  const upcoming = appointments
    ?.filter((a) => OPEN_STATUSES.includes(a.status))
    .sort((a, b) => `${a.scheduledDate}${a.scheduledTime}`.localeCompare(`${b.scheduledDate}${b.scheduledTime}`))[0]

  const checklist = [
    { label: 'Basic measurements', done: Boolean(profile?.heightCm && profile?.weightKg) },
    { label: 'Allergies & medications', done: Boolean(profile?.allergies || profile?.currentMedications) },
    { label: 'Examinations', done: Boolean(profile?.eyeExamination && profile?.dentalExamination) },
  ]
  const doneCount = checklist.filter((c) => c.done).length
  const progressPct = Math.round((doneCount / checklist.length) * 100)

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{todayGreeting()}, {user?.fullName.split(' ')[0]}</h1>
        <p className="text-sm text-muted-foreground">
          {student ? `${student.department} · Year ${student.academicYear}` : 'Welcome to UniCare'}
        </p>
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Upcoming appointment</CardTitle>
              {upcoming && <Badge>{upcoming.status}</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            {upcoming ? (
              <div className="flex items-center gap-4">
                <div className="flex size-14 flex-col items-center justify-center rounded-xl bg-muted">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">
                    {new Date(upcoming.scheduledDate).toLocaleDateString(undefined, { month: 'short' })}
                  </span>
                  <span className="text-lg font-bold">{new Date(upcoming.scheduledDate).getDate()}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold">{upcoming.scheduledTime.slice(0, 5)}</span>
                  <span className="text-sm text-muted-foreground">
                    {upcoming.assignedStaffName ? `with ${upcoming.assignedStaffName}` : 'Awaiting staff assignment'}
                  </span>
                  {upcoming.reason && <span className="text-xs text-muted-foreground">{upcoming.reason}</span>}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
            )}
            <Button asChild size="sm" className="mt-4">
              <Link to="/student/appointments">
                {upcoming ? 'View appointments' : 'Book an appointment'}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Medical profile</CardTitle>
              {profile && <Badge variant="secondary">{STATUS_LABELS[profile.status]}</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex flex-col gap-1.5">
              {checklist.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  {item.done
                    ? <CheckCircle2 className="size-4 text-green-600" />
                    : <Circle className="size-4 text-muted-foreground" />}
                  <span className={item.done ? '' : 'text-muted-foreground'}>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="inline-flex h-8 items-center rounded-md bg-secondary px-3 text-sm font-medium text-secondary-foreground opacity-50">
              Complete profile (coming soon)
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/student/appointments" className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:bg-muted/50">
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <CalendarDays className="size-[18px] text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Book appointment</span>
            <span className="text-xs text-muted-foreground">Request a new slot</span>
          </div>
        </Link>

        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 opacity-50">
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <FileText className="size-[18px] text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Upload document</span>
            <span className="text-xs text-muted-foreground">Coming soon</span>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 opacity-50">
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <Pill className="size-[18px] text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Prescriptions</span>
            <span className="text-xs text-muted-foreground">Coming soon</span>
          </div>
        </div>
      </div>
    </div>
  )
}
