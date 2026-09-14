import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getApiErrorMessage } from '@/lib/api-client'
import { useAbandonVisit, useAdvanceVisit, useCallVisit, useQueue } from './hooks'
import { VISIT_STATUS_LABELS, type QueueStage, type VisitStatus } from './types'

const STAGES: QueueStage[] = ['Nurse', 'Doctor']

function statusVariant(status: VisitStatus) {
  if (status === 'Completed') return 'default' as const
  if (status === 'Abandoned') return 'destructive' as const
  return 'secondary' as const
}

export function QueuePage() {
  const [stage, setStage] = useState<QueueStage>('Nurse')
  const { data: queue, isPending, error } = useQueue(stage)
  const call = useCallVisit()
  const advance = useAdvanceVisit()
  const abandon = useAbandonVisit()

  function onCall(id: string) {
    call.mutate(id, { onError: (e) => toast.error(getApiErrorMessage(e)) })
  }

  function onAdvance(id: string) {
    advance.mutate(id, {
      onSuccess: () => toast.success(stage === 'Nurse' ? 'Sent to doctor' : 'Visit completed'),
      onError: (e) => toast.error(getApiErrorMessage(e)),
    })
  }

  function onAbandon(id: string) {
    if (!window.confirm('Mark this visit as left without being seen?')) return
    abandon.mutate(id, { onError: (e) => toast.error(getApiErrorMessage(e)) })
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Live queue</h1>
        <p className="text-sm text-muted-foreground">Call the next patient, then send them on when done.</p>
      </div>

      <div className="mb-4 flex gap-2">
        {STAGES.map((s) => (
          <Button key={s} size="sm" variant={s === stage ? 'default' : 'outline'} onClick={() => setStage(s)}>
            {s}
          </Button>
        ))}
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {getApiErrorMessage(error)}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{stage} queue</CardTitle>
          <CardDescription>{queue ? `${queue.length} waiting or in progress` : 'Loading…'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">Loading…</TableCell>
                  </TableRow>
                )}
                {queue?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">Nobody in this queue right now.</TableCell>
                  </TableRow>
                )}
                {queue?.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell className="font-mono text-xs">#{visit.queueNumber}</TableCell>
                    <TableCell className="font-medium">
                      {visit.studentName}
                      {visit.isEmergency && <Badge variant="destructive" className="ml-2">Emergency</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(visit.status)}>
                        {visit.calledAt ? 'Called' : VISIT_STATUS_LABELS[visit.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="outline" disabled={call.isPending} onClick={() => onCall(visit.id)}>
                          Call
                        </Button>
                        <Button size="sm" disabled={advance.isPending} onClick={() => onAdvance(visit.id)}>
                          {stage === 'Nurse' ? 'Send to doctor' : 'Complete'}
                        </Button>
                        <Button size="sm" variant="destructive" disabled={abandon.isPending}
                          onClick={() => onAbandon(visit.id)}>
                          Abandon
                        </Button>
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
