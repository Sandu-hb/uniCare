import { useState } from 'react'
import { toast } from 'sonner'
import type { AccountStatus } from '@/features/auth/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getApiErrorMessage } from '@/lib/api-client'
import { useActivateStudent, useStudentAccounts, useSuspendStudent } from './hooks'

const PAGE_SIZE = 10

function statusVariant(status: AccountStatus) {
  if (status === 'Active') return 'default' as const
  if (status === 'Suspended') return 'destructive' as const
  return 'secondary' as const
}

export function StudentAccountsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<AccountStatus | ''>('PendingApproval')
  const [page, setPage] = useState(1)

  const { data, error, isPending, isFetching } = useStudentAccounts({
    search: search || undefined,
    status: status || undefined,
    page,
    pageSize: PAGE_SIZE,
  })
  const activate = useActivateStudent()
  const suspend = useSuspendStudent()

  function onSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function onStatusChange(value: AccountStatus | '') {
    setStatus(value)
    setPage(1)
  }

  function onActivate(id: string) {
    activate.mutate(id, {
      onSuccess: () => toast.success('Account activated'),
      onError: (e) => toast.error(getApiErrorMessage(e)),
    })
  }

  function onSuspend(id: string) {
    suspend.mutate(id, {
      onSuccess: () => toast.success('Account suspended'),
      onError: (e) => toast.error(getApiErrorMessage(e)),
    })
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Student account approvals</h1>
          <p className="text-sm text-muted-foreground">
            {data ? `${data.totalCount} matching` : 'Loading…'}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name or registration number…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
        <select
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as AccountStatus | '')}
        >
          <option value="">All statuses</option>
          <option value="PendingApproval">Pending approval</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
        </select>
        {isFetching && !isPending && (
          <span className="text-xs text-muted-foreground">Updating…</span>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {getApiErrorMessage(error)}
        </p>
      )}

      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Registration</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            )}

            {data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nothing here.
                </TableCell>
              </TableRow>
            )}

            {data?.items.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-mono text-xs">{account.registrationNumber}</TableCell>
                <TableCell className="font-medium">{account.fullName}</TableCell>
                <TableCell>{account.email}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(account.accountStatus)}>{account.accountStatus}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    {account.accountStatus !== 'Active' && (
                      <Button size="sm" disabled={activate.isPending} onClick={() => onActivate(account.id)}>
                        Activate
                      </Button>
                    )}
                    {account.accountStatus !== 'Suspended' && (
                      <Button size="sm" variant="outline" disabled={suspend.isPending}
                        onClick={() => onSuspend(account.id)}>
                        Suspend
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {data.page} of {data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
