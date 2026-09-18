import { CalendarX2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorBanner } from '@/components/common/ErrorBanner'
import { PageContainer } from '@/components/common/PageContainer'
import { PageHeader } from '@/components/common/PageHeader'
import { getApiErrorMessage } from '@/lib/api-client'
import { CreateAppointmentDialog } from './components/CreateAppointmentDialog'
import { useAssignableStaff, useAssignAppointmentStaff, useCancelAppointment, useAppointmentQueue } from './hooks'
import {
  APPOINTMENT_STATUS_LABELS, OPEN_STATUSES, type Appointment, type AppointmentStatus,
} from './types'

function statusVariant(status: AppointmentStatus) {
  if (status === 'Approved' || status === 'Completed') return 'default' as const
  if (status === 'Rejected' || status === 'Cancelled') return 'destructive' as const
  return 'secondary' as const
}

function AssignPicker({ appointment }: { appointment: Appointment }) {
  const { data: staff } = useAssignableStaff()
  const doctors = staff?.filter((s) => s.role === 'Doctor')
  const assign = useAssignAppointmentStaff()
  const [selected, setSelected] = useState(appointment.assignedStaffId ?? '')

  function onAssign() {
    if (!selected) return
    assign.mutate({ id: appointment.id, staffId: selected }, {
      onSuccess: () => toast.success('Staff reassigned'),
      onError: (e) => toast.error(getApiErrorMessage(e)),
    })
  }

  return (
    <div className="flex items-center gap-1.5">
      <select
        className="h-8 rounded-lg border border-input bg-muted/30 px-2 text-xs outline-none focus-visible:border-ring focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/50"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">— select —</option>
        {doctors?.map((s) => (
          <option key={s.id} value={s.id}>{s.fullName} ({s.role})</option>
        ))}
      </select>
      <Button size="sm" variant="outline" disabled={!selected || assign.isPending} onClick={onAssign}>
        Reassign
      </Button>
    </div>
  )
}

export function StaffAppointmentsPage() {
  const [status, setStatus] = useState<AppointmentStatus | ''>('')

  const { data, isPending, error } = useAppointmentQueue({
    status: status || undefined,
    pageSize: 50,
  })
  const cancel = useCancelAppointment()

  function onCancel(id: string) {
    cancel.mutate(id, {
      onSuccess: () => toast.success('Appointment cancelled'),
      onError: (e) => toast.error(getApiErrorMessage(e)),
    })
  }

  return (
    <PageContainer size="xl">
      <PageHeader
        title="Appointments"
        description="Book appointments and manage the schedule."
        actions={
          <>
            <select
              className="h-8 rounded-lg border border-input bg-muted/30 px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/50"
              value={status}
              onChange={(e) => setStatus(e.target.value as AppointmentStatus | '')}
            >
              <option value="">All statuses</option>
              {Object.entries(APPOINTMENT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <CreateAppointmentDialog />
          </>
        }
      />

      {error && <ErrorBanner error={error} />}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Requests</CardTitle>
          <CardDescription>
            {data ? `${data.totalCount} total` : 'Loading…'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending && [0, 1, 2].map((i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))}
                {data?.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <EmptyState icon={CalendarX2} message="Nothing here." />
                    </TableCell>
                  </TableRow>
                )}
                {data?.items.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell className="font-medium">{appt.studentName}</TableCell>
                    <TableCell>{appt.scheduledDate}</TableCell>
                    <TableCell>{appt.scheduledTime.slice(0, 5)}</TableCell>
                    <TableCell className="max-w-40 truncate">{appt.reason ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(appt.status)}>
                        {APPOINTMENT_STATUS_LABELS[appt.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {OPEN_STATUSES.includes(appt.status)
                        ? <AssignPicker appointment={appt} />
                        : (appt.assignedStaffName ?? '—')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        {OPEN_STATUSES.includes(appt.status) && (
                          <Button size="sm" variant="outline" disabled={cancel.isPending}
                            onClick={() => onCancel(appt.id)}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
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
