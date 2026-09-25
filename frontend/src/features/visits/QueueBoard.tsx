import { ListOrdered } from 'lucide-react'
import { type ReactNode } from 'react'
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
import { ROLES } from '@/config/roles'
import { useAuth } from '@/features/auth/auth-context'
import { getApiErrorMessage } from '@/lib/api-client'
import { AbandonVisitDialog } from './components/AbandonVisitDialog'
import { useCallVisit, useQueue } from './hooks'
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

  function onCall(id: string) {
    call.mutate(id, { onError: (e) => toast.error(getApiErrorMessage(e)) })
  }

  return (
    <PageContainer size="lg">
      <PageHeader title={title} description={description} />

      {error && <ErrorBanner error={error} />}

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
                {isPending && [0, 1, 2].map((i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="ml-auto h-8 w-24" /></TableCell>
                  </TableRow>
                ))}
                {queue?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <EmptyState icon={ListOrdered} message="Nobody in this queue right now." />
                    </TableCell>
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
                          <AbandonVisitDialog visitId={visit.id} studentName={visit.studentName} />
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
