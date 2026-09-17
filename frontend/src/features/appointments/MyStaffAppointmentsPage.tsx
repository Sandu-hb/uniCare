import { Badge } from '@/components/ui/badge'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getApiErrorMessage } from '@/lib/api-client'
import { useMyStaffAppointments } from './hooks'
import { APPOINTMENT_STATUS_LABELS, type AppointmentStatus } from './types'

function statusVariant(status: AppointmentStatus) {
  if (status === 'Approved' || status === 'Completed') return 'default' as const
  if (status === 'Rejected' || status === 'Cancelled') return 'destructive' as const
  return 'secondary' as const
}

export function MyStaffAppointmentsPage() {
  const { data: appointments, isPending, error } = useMyStaffAppointments()

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">My appointments</h1>
        <p className="text-sm text-muted-foreground">Appointments the medical centre has assigned to you.</p>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {getApiErrorMessage(error)}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming and past appointments</CardTitle>
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
                  <TableHead>Student</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                )}
                {appointments?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No appointments assigned to you yet.
                    </TableCell>
                  </TableRow>
                )}
                {appointments?.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell>{appt.scheduledDate}</TableCell>
                    <TableCell>{appt.scheduledTime.slice(0, 5)}</TableCell>
                    <TableCell className="font-medium">{appt.studentName}</TableCell>
                    <TableCell className="max-w-40 truncate">{appt.reason ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(appt.status)}>
                        {APPOINTMENT_STATUS_LABELS[appt.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
