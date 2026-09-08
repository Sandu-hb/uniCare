import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { getApiErrorMessage } from '@/lib/api-client'
import { useUploadDocument } from '../hooks'
import {
  ACCEPTED_EXTENSIONS, DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS, MAX_SIZE_BYTES,
  type DocumentType,
} from '../types'

export function UploadDocumentDialog({ studentId }: { studentId: string }) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<DocumentType>('HospitalReport')
  const upload = useUploadDocument(studentId)

  // Fast, friendly feedback only — the server enforces this independently and
  // is the actual authority. A client can always bypass this check entirely.
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

  function onSubmit() {
    if (!file) return
    upload.mutate(
      { file, documentType },
      {
        onSuccess: () => {
          toast.success(`${file.name} uploaded`)
          setFile(null)
          setOpen(false)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Upload document</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload medical document</DialogTitle>
          <DialogDescription>
            PDF, JPG or PNG, up to {MAX_SIZE_BYTES / 1024 / 1024} MB.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="documentType">Document type</Label>
            <select
              id="documentType"
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
            >
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>{DOCUMENT_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="file">File</Label>
            <input
              id="file"
              type="file"
              accept={ACCEPTED_EXTENSIONS.join(',')}
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!file || upload.isPending} onClick={onSubmit}>
            {upload.isPending ? 'Uploading…' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
