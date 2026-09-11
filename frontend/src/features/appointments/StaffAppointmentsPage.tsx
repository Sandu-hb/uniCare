import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getApiErrorMessage } from '@/lib/api-client'
import {
  useApproveAppointment, useAssignableStaff, useAssignAppointmentStaff,
  useCancelAppointment, useAppointmentQueue, useRejectAppointment,
} from './hooks'
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
  const assign = useAssignAppointmentStaff()
  const [selected, setSelected] = useState(appointment.assignedStaffId ?? '')

  function onAssign() {
    if (!selected) return
    assign.mutate({ id: appointment.id, staffId: selected }, {
      onSuccess: () => toast.success('Staff assigned'),
      onError: (e) => toast.error(getApiErrorMessage(e)),
    })
  }

  return (
    <div className="flex items-center gap-1.5">
      <select
        className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">— select —</option>
        {staff?.map((s) => (
          <option key={s.id} value={s.id}>{s.fullName} ({s.role})</option>
        ))}
      </select>
      <Button size="sm" variant="outline" disabled={!selected || assign.isPending} onClick={onAssign}>
        Assign
      </Button>
    </div>
  )
}

export function StaffAppointmentsPage() {
  const [status, setStatus] = useState<AppointmentStatus | ''>('Requested')

  const { data, isPending, error } = useAppointmentQueue({
    status: status || undefined,
    pageSize: 50,
  })
  const approve = useApproveAppointment()
  const reject = useRejectAppointment()
  const cancel = useCancelAppointment()

  function onApprove(id: string) {
    approve.mutate({ id }, {
      onSuccess: () => toast.success('Appointment approved'),
      onError: (e) => toast.error(getApiErrorMessage(e)),
    })
  }

  function onReject(id: string) {
    const reason = window.prompt('Why is this appointment being declined?')
    if (!reason?.trim()) return
    reject.mutate({ id, reason }, {
      onSuccess: () => toast.success('Appointment declined'),
      onError: (e) => toast.error(getApiErrorMessage(e)),
    })
  }

  function onCancel(id: string) {
    cancel.mutate(id, {
      onSuccess: () => toast.success('Appointment cancelled'),
      onError: (e) => toast.error(getApiErrorMessage(e)),
    })
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Appointment queue</h1>
          <p className="text-sm text-muted-foreground">Approve, decline, or assign a doctor.</p>
        </div>
        <select
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as AppointmentStatus | '')}
        >
          <option value="">All statuses</option>
          {Object.entries(APPOINTMENT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {getApiErrorMessage(error)}
        </p>
      )}

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
                {isPending && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                )}
                {data?.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Nothing here.
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
                        {appt.status === 'Requested' && (
                          <>
                            <Button size="sm" disabled={approve.isPending} onClick={() => onApprove(appt.id)}>
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" disabled={reject.isPending}
                              onClick={() => onReject(appt.id)}>
                              Decline
                            </Button>
                          </>
                        )}
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
    </div>
  )
}
