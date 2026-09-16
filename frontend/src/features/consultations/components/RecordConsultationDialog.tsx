import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getApiErrorMessage } from '@/lib/api-client'
import { useConsultation, useUpsertConsultation } from '../hooks'

/** Mirrors UpsertConsultationRequestValidator on the server. */
const schema = z.object({
  symptoms: z.string().max(2000).optional(),
  examinationFindings: z.string().max(2000).optional(),
  treatment: z.string().max(2000).optional(),
  followUpInstructions: z.string().max(2000).optional(),
  diagnoses: z.array(z.object({
    description: z.string().min(1, 'Required').max(256),
    icdCode: z.string().max(16).optional(),
    isPrimary: z.boolean(),
  })),
})

type FormValues = z.infer<typeof schema>

function Field({ id, label, error, children }: {
  id: string; label: string; error?: string; children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function RecordConsultationDialog({ visitId, studentName }: { visitId: string; studentName: string }) {
  const [open, setOpen] = useState(false)
  const { data: existing } = useConsultation(visitId, open)
  const upsert = useUpsertConsultation(visitId)

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { diagnoses: [] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'diagnoses' })

  useEffect(() => {
    if (existing) {
      reset({
        symptoms: existing.symptoms ?? '',
        examinationFindings: existing.examinationFindings ?? '',
        treatment: existing.treatment ?? '',
        followUpInstructions: existing.followUpInstructions ?? '',
        diagnoses: existing.diagnoses.map((d) => ({
          description: d.description,
          icdCode: d.icdCode ?? '',
          isPrimary: d.isPrimary,
        })),
      })
    }
  }, [existing, reset])

  function onSubmit(values: FormValues) {
    upsert.mutate(values, {
      onSuccess: () => {
        toast.success('Consultation recorded')
        setOpen(false)
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Consultation</Button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Record consultation</DialogTitle>
          <DialogDescription>{studentName}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <Field id="symptoms" label="Symptoms" error={errors.symptoms?.message}>
            <Textarea id="symptoms" rows={2} {...register('symptoms')} />
          </Field>

          <Field id="examinationFindings" label="Examination findings" error={errors.examinationFindings?.message}>
            <Textarea id="examinationFindings" rows={2} {...register('examinationFindings')} />
          </Field>

          <Field id="treatment" label="Treatment" error={errors.treatment?.message}>
            <Textarea id="treatment" rows={2} {...register('treatment')} />
          </Field>

          <Field id="followUpInstructions" label="Follow-up instructions" error={errors.followUpInstructions?.message}>
            <Textarea id="followUpInstructions" rows={2} {...register('followUpInstructions')} />
          </Field>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Diagnoses</Label>
              <Button type="button" size="sm" variant="outline"
                onClick={() => append({ description: '', icdCode: '', isPrimary: fields.length === 0 })}>
                <Plus className="size-3.5" /> Add
              </Button>
            </div>

            {fields.length === 0 && (
              <p className="text-xs text-muted-foreground">No diagnoses recorded.</p>
            )}

            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2 rounded-lg border border-border p-2">
                <div className="grid flex-1 gap-2">
                  <Input placeholder="Diagnosis" {...register(`diagnoses.${index}.description`)} />
                  {errors.diagnoses?.[index]?.description && (
                    <p className="text-xs text-destructive">
                      {errors.diagnoses[index]?.description?.message}
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    <Input placeholder="ICD code (optional)" className="max-w-40"
                      {...register(`diagnoses.${index}.icdCode`)} />
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <input type="checkbox" className="size-3.5 accent-primary"
                        {...register(`diagnoses.${index}.isPrimary`)} />
                      Primary
                    </label>
                  </div>
                </div>
                <Button type="button" size="icon-sm" variant="ghost" aria-label="Remove diagnosis"
                  onClick={() => remove(index)}>
                  <X className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={upsert.isPending}>
              {upsert.isPending ? 'Saving…' : 'Save consultation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
