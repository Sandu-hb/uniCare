import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getApiErrorMessage } from '@/lib/api-client'
import { useDispensePrescription, usePrescription } from '../hooks'

export function DispensePrescriptionDialog({ visitId, studentName }: { visitId: string; studentName: string }) {
  const [open, setOpen] = useState(false)
  const { data: prescription } = usePrescription(visitId, open)
  const dispense = useDispensePrescription(visitId)

  function onSubmit() {
    dispense.mutate(undefined, {
      onSuccess: () => {
        toast.success('Prescription dispensed')
        setOpen(false)
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Dispense</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Dispense prescription</DialogTitle>
          <DialogDescription>{studentName}</DialogDescription>
        </DialogHeader>

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
              {!prescription && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">Loading…</TableCell>
                </TableRow>
              )}
              {prescription?.items.map((item, index) => (
                <TableRow key={index}>
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

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="button" disabled={dispense.isPending} onClick={onSubmit}>
            {dispense.isPending ? 'Dispensing…' : 'Mark dispensed'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
