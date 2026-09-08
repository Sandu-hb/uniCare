import { useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getApiErrorMessage } from '@/lib/api-client'
import { UploadDocumentDialog } from './components/UploadDocumentDialog'
import { useDocuments } from './hooks'
import { DOCUMENT_TYPE_LABELS } from './types'

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function DocumentsPage() {
  const { studentId = '' } = useParams()
  const { data: documents, isPending, error } = useDocuments(studentId)

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Medical documents</h1>
          <p className="text-sm text-muted-foreground">
            Hospital-verified documents for AI-assisted record extraction.
          </p>
        </div>
        <UploadDocumentDialog studentId={studentId} />
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {getApiErrorMessage(error)}
        </p>
      )}

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
                {isPending && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                )}
                {documents?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No documents uploaded yet.
                    </TableCell>
                  </TableRow>
                )}
                {documents?.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.originalFileName}</TableCell>
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
    </div>
  )
}
