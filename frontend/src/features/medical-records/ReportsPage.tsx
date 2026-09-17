import { Badge } from '@/components/ui/badge'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { useMyStudent } from '@/features/students/hooks'
import { getApiErrorMessage } from '@/lib/api-client'
import { useVisitHistory } from './hooks'

export function ReportsPage() {
  const { data: student, isPending: studentPending } = useMyStudent()
  const studentId = student?.id ?? ''
  const { data: visits, isPending, error } = useVisitHistory(studentId)

  const recorded = visits?.filter((v) => v.doctorName !== null)

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Your consultation and lab records from past visits to the medical centre.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {getApiErrorMessage(error)}
        </p>
      )}

      {(studentPending || isPending) && (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}

      {recorded?.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No completed consultations yet.
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
    </div>
  )
}
