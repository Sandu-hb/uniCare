import { Pill } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorBanner } from '@/components/common/ErrorBanner'
import { PageContainer } from '@/components/common/PageContainer'
import { PageHeader } from '@/components/common/PageHeader'
import { useMyStudent } from '@/features/students/hooks'
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
  const loading = studentPending || isPending

  return (
    <PageContainer size="md">
      <PageHeader title="Prescriptions" description="Medicine prescribed to you, by visit." />

      {error && <ErrorBanner error={error} />}

      {loading && (
        <div className="grid gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {!loading && prescribed?.length === 0 && (
        <Card>
          <CardContent>
            <EmptyState icon={Pill} message="No prescriptions yet." />
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
    </PageContainer>
  )
}
