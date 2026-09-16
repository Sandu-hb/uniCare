import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { getApiErrorMessage } from '@/lib/api-client'
import { useDocuments, useUploadDocument } from '../hooks'
import { ACCEPTED_EXTENSIONS, MAX_SIZE_BYTES } from '../types'

/**
 * A dedicated slot for the one document type that is not a medical record —
 * MedicalProfileService requires it separately before a profile can be
 * submitted for verification, so it gets its own card rather than living
 * inside the generic multi-type uploader.
 */
export function UniversityIdUploadCard({ studentId, disabled }: { studentId: string; disabled?: boolean }) {
  const { data: documents } = useDocuments(studentId)
  const upload = useUploadDocument(studentId)
  const [file, setFile] = useState<File | null>(null)

  const existing = documents?.find((d) => d.documentType === 'UniversityId')

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
      { file, documentType: 'UniversityId' },
      {
        onSuccess: () => {
          toast.success('University ID uploaded')
          setFile(null)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">University ID</CardTitle>
        <CardDescription>
          Upload a clear photo or scan of your student ID card, for identity verification.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {existing
          ? (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary">Uploaded</Badge>
              <span className="truncate text-muted-foreground">{existing.originalFileName}</span>
            </div>
          )
          : <p className="text-sm text-muted-foreground">Not yet uploaded.</p>}

        {!disabled && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              accept={ACCEPTED_EXTENSIONS.join(',')}
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
            <Button type="button" size="sm" disabled={!file || upload.isPending} onClick={onUpload}>
              {upload.isPending ? 'Uploading…' : existing ? 'Replace' : 'Upload'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
