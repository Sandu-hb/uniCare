import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { getApiErrorMessage } from '@/lib/api-client'
import { useDocuments, useUploadDocument } from '../hooks'
import {
  ACCEPTED_EXTENSIONS, DOCUMENT_TYPE_LABELS, DOCUMENT_TYPES, MAX_SIZE_BYTES,
  type DocumentType,
} from '../types'

/** Every type except UniversityId — that one has its own dedicated card. */
const REPORT_TYPES = DOCUMENT_TYPES.filter((t) => t !== 'UniversityId')

/**
 * Medical reports, unlike the university ID, are not one slot — a student may
 * have several (a hospital report, a lab result, a vaccination record). This
 * lists what's already uploaded and lets more be added, without leaving the
 * registration page for the separate Documents page.
 */
export function MedicalReportsUploadCard({ studentId, disabled }: { studentId: string; disabled?: boolean }) {
  const { data: documents } = useDocuments(studentId)
  const upload = useUploadDocument(studentId)
  const [file, setFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<DocumentType>('HospitalReport')

  const reports = documents?.filter((d) => d.documentType !== 'UniversityId') ?? []

  function onFileChange(selected: File | null) {
    if (!selected) {
      setFile(null)
      return
    }
    const extension = `.${selected.name.split('.').pop()?.toLowerCase()}`
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      toast.error(`File type ${extension} isn't accepted. Allowed: ${ACCEPTED_EXTENSIONS.join(', ')}`)
      return
    }
    if (selected.size > MAX_SIZE_BYTES) {
      toast.error(`File exceeds the ${MAX_SIZE_BYTES / 1024 / 1024} MB limit.`)
      return
    }
    setFile(selected)
  }

  function onUpload() {
    if (!file) return
    upload.mutate(
      { file, documentType },
      {
        onSuccess: () => {
          toast.success(`${file.name} uploaded`)
          setFile(null)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Medical reports</CardTitle>
        <CardDescription>
          Upload your hospital report and any other supporting medical documents.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {reports.length === 0
          ? <p className="text-sm text-muted-foreground">Nothing uploaded yet.</p>
          : (
            <ul className="grid gap-1.5">
              {reports.map((doc) => (
                <li key={doc.id} className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">{DOCUMENT_TYPE_LABELS[doc.documentType]}</Badge>
                  <span className="truncate text-muted-foreground">{doc.originalFileName}</span>
                </li>
              ))}
            </ul>
          )}

        {!disabled && (
          <div className="flex flex-wrap items-end gap-2">
            <div className="grid gap-1.5">
              <Label htmlFor="reportType" className="text-xs">Type</Label>
              <select
                id="reportType"
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              >
                {REPORT_TYPES.map((t) => (
                  <option key={t} value={t}>{DOCUMENT_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <input
              type="file"
              accept={ACCEPTED_EXTENSIONS.join(',')}
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
            <Button type="button" size="sm" disabled={!file || upload.isPending} onClick={onUpload}>
              {upload.isPending ? 'Uploading…' : 'Upload'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
