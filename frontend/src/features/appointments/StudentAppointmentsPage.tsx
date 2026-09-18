import { CalendarX2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorBanner } from '@/components/common/ErrorBanner'
import { PageContainer } from '@/components/common/PageContainer'
import { PageHeader } from '@/components/common/PageHeader'
import { useMyStudent } from '@/features/students/hooks'
import { useMyAppointments } from './hooks'
import { APPOINTMENT_STATUS_LABELS, type AppointmentStatus } from './types'

function statusVariant(status: AppointmentStatus) {
  if (status === 'Approved' || status === 'Completed') return 'default' as const
  if (status === 'Rejected' || status === 'Cancelled') return 'destructive' as const
  return 'secondary' as const
}

export function StudentAppointmentsPage() {
  const { data: student, isPending: studentPending } = useMyStudent()
  const studentId = student?.id ?? ''

  const { data: appointments, isPending, error } = useMyAppointments(studentId)
  const loading = studentPending || isPending

  return (
    <PageContainer size="md">
      <PageHeader
        title="My appointments"
        description="Appointments booked for you by the medical centre."
      />

      {error && <ErrorBanner error={error} />}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming and past requests</CardTitle>
          <CardDescription>
            {appointments ? `${appointments.length} total` : 'Loading…'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned to</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && [0, 1].map((i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))}
                {appointments?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <EmptyState icon={CalendarX2} message="No appointments yet." />
                    </TableCell>
                  </TableRow>
                )}
                {appointments?.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell>{appt.scheduledDate}</TableCell>
                    <TableCell>{appt.scheduledTime.slice(0, 5)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(appt.status)}>
                        {APPOINTMENT_STATUS_LABELS[appt.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{appt.assignedStaffName ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
