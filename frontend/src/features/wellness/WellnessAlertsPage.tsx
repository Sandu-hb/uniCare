import { AlertTriangle, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorBanner } from '@/components/common/ErrorBanner'
import { PageContainer } from '@/components/common/PageContainer'
import { PageHeader } from '@/components/common/PageHeader'
import { cn } from '@/lib/utils'
import { useFlaggedSessionDetail, useFlaggedSessions } from './hooks'

export function WellnessAlertsPage() {
  const { data: sessions, isPending, error } = useFlaggedSessions()
  const [selectedId, setSelectedId] = useState('')
  const { data: detail, isPending: detailPending } = useFlaggedSessionDetail(selectedId)

  return (
    <PageContainer size="xl">
      <PageHeader
        title="Wellness Alerts"
        description="Counselling chats the assistant flagged as showing possible crisis indicators. Ordinary
          conversations stay private — only flagged sessions are ever visible here."
      />

      {error && <ErrorBanner error={error} />}

      {isPending && (
        <div className="grid gap-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      )}

      {!isPending && sessions?.length === 0 && (
        <Card>
          <CardContent>
            <EmptyState icon={ShieldCheck} message="No flagged sessions." />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2 self-start">
          {sessions?.map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => setSelectedId(session.id)}
              className={cn(
                'flex items-center justify-between gap-2 rounded-lg border border-border p-3 text-left text-sm transition-colors hover:bg-muted',
                selectedId === session.id && 'border-primary bg-muted',
              )}
            >
              <div>
                <div className="font-medium">{session.studentName}</div>
                <div className="text-xs text-muted-foreground">
                  Last message {new Date(session.lastMessageAt).toLocaleString()}
                </div>
              </div>
              <AlertTriangle className="size-4 shrink-0 text-destructive" />
            </button>
          ))}
        </div>

        {selectedId && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{detail?.studentName}</CardTitle>
                {detail && <Badge variant={detail.status === 'Ended' ? 'secondary' : 'default'}>{detail.status}</Badge>}
              </div>
              <CardDescription>
                {detail && `Started ${new Date(detail.startedAt).toLocaleString()}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
              {detailPending && <p className="text-sm text-muted-foreground">Loading…</p>}
              {detail?.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm',
                    message.role === 'Student' ? 'bg-muted' : 'bg-primary/10',
                  )}
                >
                  <div className="mb-0.5 text-xs font-medium text-muted-foreground">
                    {message.role === 'Student' ? detail.studentName : 'Assistant'}
                  </div>
                  {message.content}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  )
}
