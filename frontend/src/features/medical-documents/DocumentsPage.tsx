import { FileX2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
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
import { getApiErrorMessage } from '@/lib/api-client'
import { getDocumentContent } from './api'
import { UploadDocumentDialog } from './components/UploadDocumentDialog'
import { useDocuments } from './hooks'
import { DOCUMENT_TYPE_LABELS, type MedicalDocument } from './types'

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function DocumentsPage() {
  const { studentId: routeStudentId } = useParams()
  const isOwnView = !routeStudentId
  const { data: myStudent } = useMyStudent()
  const studentId = routeStudentId ?? myStudent?.id ?? ''

  const { data: documents, isPending, error } = useDocuments(studentId)

  async function onView(doc: MedicalDocument) {
    try {
      const blob = await getDocumentContent(studentId, doc.id)
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      // The tab has its own reference to the bytes now; free ours once it's
      // had a moment to load rather than leaking the object URL forever.
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    }
  }

  return (
    <PageContainer size="md">
      {isOwnView && (
        <Link to="/student/medical-profile" className="mb-3 inline-block text-xs text-muted-foreground hover:underline">
          ← Medical profile
        </Link>
      )}
      <PageHeader
        title="Medical documents"
        description="Hospital-verified documents for AI-assisted record extraction."
        actions={isOwnView && studentId && <UploadDocumentDialog studentId={studentId} />}
      />

      {error && <ErrorBanner error={error} />}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Uploaded documents</CardTitle>
          <CardDescription>
            {documents ? `${documents.length} on file` : 'Loading…'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending && [0, 1].map((i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))}
                {documents?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <EmptyState icon={FileX2} message="No documents uploaded yet." />
                    </TableCell>
                  </TableRow>
                )}
                {documents?.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <button
                        type="button"
                        onClick={() => onView(doc)}
                        className="text-left hover:underline"
                      >
                        {doc.originalFileName}
                      </button>
                    </TableCell>
                    <TableCell>{DOCUMENT_TYPE_LABELS[doc.documentType]}</TableCell>
                    <TableCell className="tabular-nums">{formatSize(doc.sizeBytes)}</TableCell>
                    <TableCell><Badge variant="secondary">{doc.status}</Badge></TableCell>
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
