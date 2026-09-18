import { FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorBanner } from '@/components/common/ErrorBanner'
import { PageContainer } from '@/components/common/PageContainer'
import { PageHeader } from '@/components/common/PageHeader'
import { useMyStudent } from '@/features/students/hooks'
import { useVisitHistory } from './hooks'

export function ReportsPage() {
  const { data: student, isPending: studentPending } = useMyStudent()
  const studentId = student?.id ?? ''
  const { data: visits, isPending, error } = useVisitHistory(studentId)

  const recorded = visits?.filter((v) => v.doctorName !== null)
  const loading = studentPending || isPending

  return (
    <PageContainer size="md">
      <PageHeader
        title="Reports"
        description="Your consultation and lab records from past visits to the medical centre."
      />

      {error && <ErrorBanner error={error} />}

      {loading && (
        <div className="grid gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {!loading && recorded?.length === 0 && (
        <Card>
          <CardContent>
            <EmptyState icon={FileText} message="No completed consultations yet." />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {recorded?.map((visit) => (
          <Card key={visit.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">
                  {new Date(visit.checkedInAt).toLocaleDateString(undefined, {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </CardTitle>
                <Badge variant={visit.status === 'Completed' ? 'default' : 'secondary'}>{visit.status}</Badge>
              </div>
              <CardDescription>{visit.doctorName}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              {visit.symptoms && (
                <div><span className="font-medium">Symptoms: </span>{visit.symptoms}</div>
              )}
              {visit.examinationFindings && (
                <div><span className="font-medium">Examination: </span>{visit.examinationFindings}</div>
              )}
              {visit.treatment && (
                <div><span className="font-medium">Treatment: </span>{visit.treatment}</div>
              )}
              {visit.followUpInstructions && (
                <div><span className="font-medium">Follow-up: </span>{visit.followUpInstructions}</div>
              )}

              {visit.diagnoses.length > 0 && (
                <div>
                  <span className="font-medium">Diagnoses: </span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {visit.diagnoses.map((d, i) => (
                      <Badge key={i} variant={d.isPrimary ? 'default' : 'secondary'}>
                        {d.description}{d.icdCode ? ` (${d.icdCode})` : ''}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {visit.labRequestDetails && (
                <div className="rounded-md border border-border p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-medium">Lab: {visit.labRequestDetails}</span>
                    {visit.labStatus && <Badge variant="secondary">{visit.labStatus}</Badge>}
                  </div>
                  {visit.labResultNotes && (
                    <p className="text-muted-foreground">{visit.labResultNotes}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  )
}
