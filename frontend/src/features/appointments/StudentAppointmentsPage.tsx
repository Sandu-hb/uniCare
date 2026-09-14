import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useMedicalProfile } from '@/features/medical-profiles/hooks'
import { getApiErrorMessage } from '@/lib/api-client'
import { useMyStudent } from '@/features/students/hooks'
import { BookAppointmentDialog } from './components/BookAppointmentDialog'
import { useCancelAppointment, useMyAppointments } from './hooks'
import { APPOINTMENT_STATUS_LABELS, OPEN_STATUSES, type AppointmentStatus } from './types'

function statusVariant(status: AppointmentStatus) {
  if (status === 'Approved' || status === 'Completed') return 'default' as const
  if (status === 'Rejected' || status === 'Cancelled') return 'destructive' as const
  return 'secondary' as const
}

export function StudentAppointmentsPage() {
  const { data: student, isPending: studentPending } = useMyStudent()
  const studentId = student?.id ?? ''

  const { data: appointments, isPending, error } = useMyAppointments(studentId)
  const { data: profile } = useMedicalProfile(studentId)
  const cancel = useCancelAppointment()
  const canBook = profile?.status === 'Verified'

  function onCancel(id: string) {
    cancel.mutate(id, {
      onSuccess: () => toast.success('Appointment cancelled'),
      onError: (e) => toast.error(getApiErrorMessage(e)),
    })
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My appointments</h1>
          <p className="text-sm text-muted-foreground">
            Request a slot; a staff member will approve or decline it.
          </p>
        </div>
        {studentId && canBook && <BookAppointmentDialog studentId={studentId} />}
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {getApiErrorMessage(error)}
        </p>
      )}

      {studentId && !canBook && (
        <div className="mb-4 rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-sm font-medium">Your medical profile must be verified before you can book.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload your medical report and complete your profile, then wait for staff to review it.
          </p>
          <Button asChild size="sm" variant="secondary" className="mt-3">
            <Link to="/student/medical-profile">Go to medical profile</Link>
          </Button>
        </div>
      )}

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
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {(studentPending || isPending) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                )}
                {appointments?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No appointments yet.
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
                    <TableCell className="text-right">
                      {OPEN_STATUSES.includes(appt.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={cancel.isPending}
                          onClick={() => onCancel(appt.id)}
                        >
                          Cancel
                        </Button>
                      )}
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
