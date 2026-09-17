import { type ReactNode } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ROLES } from '@/config/roles'
import { useAuth } from '@/features/auth/auth-context'
import { getApiErrorMessage } from '@/lib/api-client'
import { useAbandonVisit, useCallVisit, useQueue } from './hooks'
import { VISIT_STATUS_LABELS, type QueueStage, type Visit, type VisitStatus } from './types'

function statusVariant(status: VisitStatus) {
  if (status === 'Completed') return 'default' as const
  if (status === 'Abandoned') return 'destructive' as const
  return 'secondary' as const
}

/**
 * Shared shell for the three live queue pages (Doctor, Laboratory, Pharmacy).
 * Each stage's specific clinical action (recording a consultation, completing
 * a lab order, dispensing a prescription) is auto-routing — see
 * VisitService.RouteNextStageAsync — so this board only ever shows Call and
 * (Admin-only) Abandon plus whatever `renderAction` supplies per row.
 */
export function QueueBoard({ title, description, stage, renderAction }: {
  title: string
  description: string
  stage: QueueStage
  renderAction: (visit: Visit) => ReactNode
}) {
  const { hasRole } = useAuth()
  const { data: queue, isPending, error } = useQueue(stage)
  const call = useCallVisit()
  const abandon = useAbandonVisit()

  function onCall(id: string) {
    call.mutate(id, { onError: (e) => toast.error(getApiErrorMessage(e)) })
  }

  function onAbandon(id: string) {
    if (!window.confirm('Mark this visit as left without being seen?')) return
    abandon.mutate(id, { onError: (e) => toast.error(getApiErrorMessage(e)) })
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {getApiErrorMessage(error)}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live queue</CardTitle>
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
                      {!visit.appointmentId && <Badge variant="secondary" className="ml-2">Walk-in</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(visit.status)}>
                        {visit.calledAt ? 'Called' : VISIT_STATUS_LABELS[visit.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        {renderAction(visit)}
                        <Button size="sm" variant="outline" disabled={call.isPending} onClick={() => onCall(visit.id)}>
                          Call
                        </Button>
                        {hasRole(ROLES.Admin) && (
                          <Button size="sm" variant="destructive" disabled={abandon.isPending}
                            onClick={() => onAbandon(visit.id)}>
                            Abandon
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
