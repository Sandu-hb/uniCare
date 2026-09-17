import { Badge } from '@/components/ui/badge'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useMyStudent } from '@/features/students/hooks'
import { getApiErrorMessage } from '@/lib/api-client'
import { useVisitHistory } from './hooks'

function statusVariant(status: string) {
  if (status === 'Dispensed') return 'default' as const
  if (status === 'Cancelled') return 'destructive' as const
  return 'secondary' as const
}

export function PrescriptionsPage() {
  const { data: student, isPending: studentPending } = useMyStudent()
  const studentId = student?.id ?? ''
  const { data: visits, isPending, error } = useVisitHistory(studentId)

  const prescribed = visits?.filter((v) => v.prescriptionItems.length > 0)

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Prescriptions</h1>
        <p className="text-sm text-muted-foreground">Medicine prescribed to you, by visit.</p>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {getApiErrorMessage(error)}
        </p>
      )}

      {(studentPending || isPending) && (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}

      {prescribed?.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No prescriptions yet.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {prescribed?.map((visit) => (
          <Card key={visit.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">
                  {new Date(visit.checkedInAt).toLocaleDateString(undefined, {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </CardTitle>
                {visit.prescriptionStatus && (
                  <Badge variant={statusVariant(visit.prescriptionStatus)}>{visit.prescriptionStatus}</Badge>
                )}
              </div>
              <CardDescription>{visit.doctorName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead className="text-right">Days</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visit.prescriptionItems.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{item.medicineName}</TableCell>
                        <TableCell>{item.dosage}</TableCell>
                        <TableCell>{item.frequency}</TableCell>
                        <TableCell className="text-right">{item.durationDays}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
