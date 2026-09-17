import { CalendarDays, ClipboardCheck, ListOrdered, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { useAppointmentQueue } from '@/features/appointments/hooks'
import { useAuth } from '@/features/auth/auth-context'
import { ROLES, type Role } from '@/config/roles'
import { useStudentAccounts } from '@/features/students/hooks'
import { useQueue } from '@/features/visits/hooks'
import { VISIT_STATUS_LABELS } from '@/features/visits/types'

function todayGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function StatCard({ icon, label, value, hint }: {
  icon: React.ReactNode; label: string; value: number | string; hint?: string
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">{icon}</div>
          {hint && <span className="text-xs font-medium text-muted-foreground">{hint}</span>}
        </div>
        <div>
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function myQueueRoute(hasRole: (...roles: Role[]) => boolean): string {
  if (hasRole(ROLES.LabStaff)) return '/staff/lab-queue'
  if (hasRole(ROLES.PharmacyStaff)) return '/staff/pharmacy-queue'
  return '/staff/queue'
}

export function StaffDashboardPage() {
  const { user, hasRole } = useAuth()
  const isAdmin = hasRole(ROLES.Admin)
  const today = new Date().toISOString().slice(0, 10)
  const queueRoute = myQueueRoute(hasRole)

  const { data: doctorQueue } = useQueue('Doctor')
  const { data: labQueue } = useQueue('Laboratory')
  const { data: pharmacyQueue } = useQueue('Pharmacy')
  const { data: appointmentsToday } = useAppointmentQueue({ date: today, pageSize: 100 })
  const { data: pending } = useStudentAccounts(
    { status: 'PendingApproval', pageSize: 5 }, isAdmin,
  )

  const queueEntries = [...(doctorQueue ?? []), ...(labQueue ?? []), ...(pharmacyQueue ?? [])]
    .sort((a, b) => a.queueNumber - b.queueNumber)

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{todayGreeting()}, {user?.fullName.split(' ')[0]}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
            {' '}· Medical Centre overview
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button asChild size="sm" variant="outline">
              <Link to="/students">Review approvals</Link>
            </Button>
          )}
          <Button asChild size="sm">
            <Link to={queueRoute}>Open queue</Link>
          </Button>
        </div>
      </div>

      <div className={`mb-5 grid gap-4 ${isAdmin ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {isAdmin && (
          <StatCard
            icon={<ShieldCheck className="size-[18px] text-primary" />}
            label="Pending approvals"
            value={pending?.totalCount ?? '—'}
            hint="Awaiting you"
          />
        )}
        <StatCard
          icon={<ListOrdered className="size-[18px] text-primary" />}
          label="In today's queue"
          value={queueEntries.length}
          hint="Right now"
        />
        <StatCard
          icon={<CalendarDays className="size-[18px] text-primary" />}
          label="Appointments today"
          value={appointmentsToday?.totalCount ?? '—'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Today's queue</CardTitle>
              <Link to={queueRoute} className="text-xs font-medium text-primary hover:underline">View all</Link>
            </div>
            <CardDescription>{queueEntries.length} waiting or in progress</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {queueEntries.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">Nobody in the queue right now.</p>
            )}
            {queueEntries.slice(0, 5).map((v) => (
              <div key={v.id} className="flex items-center justify-between border-b border-border py-2.5 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-8 font-mono text-xs text-muted-foreground">#{v.queueNumber}</span>
                  <span className="text-sm font-medium">{v.studentName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{v.stage}</Badge>
                  <Badge>{v.calledAt ? 'Called' : VISIT_STATUS_LABELS[v.status]}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {isAdmin ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Pending approvals</CardTitle>
                <Badge>{pending?.totalCount ?? 0}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {pending?.items.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">Nothing waiting on approval.</p>
              )}
              {pending?.items.map((s) => (
                <div key={s.id} className="flex items-center justify-between border-b border-border py-2.5 last:border-0">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{s.fullName}</span>
                    <span className="font-mono text-xs text-muted-foreground">{s.registrationNumber}</span>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/students">Review</Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button asChild variant="secondary" className="justify-start">
                <Link to={queueRoute}><ClipboardCheck className="size-4" /> Open live queue</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
