import { Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorBanner } from '@/components/common/ErrorBanner'
import { PageContainer } from '@/components/common/PageContainer'
import { PageHeader } from '@/components/common/PageHeader'
import type { AccountStatus } from '@/features/auth/types'
import { getApiErrorMessage } from '@/lib/api-client'
import { CreateStaffDialog } from './components/CreateStaffDialog'
import { useActivateStaff, useStaffAccounts, useSuspendStaff } from './hooks'
import { STAFF_ROLES, type StaffRole } from './types'

const PAGE_SIZE = 10

function statusVariant(status: AccountStatus) {
  if (status === 'Active') return 'default' as const
  if (status === 'Suspended') return 'destructive' as const
  return 'secondary' as const
}

export function StaffPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<AccountStatus | ''>('')
  const [role, setRole] = useState<StaffRole | ''>('')
  const [page, setPage] = useState(1)

  const { data, error, isPending, isFetching } = useStaffAccounts({
    status: status || undefined,
    role: role || undefined,
    page,
    pageSize: PAGE_SIZE,
  })
  const activate = useActivateStaff()
  const suspend = useSuspendStaff()

  function onStatusChange(value: AccountStatus | '') {
    setStatus(value)
    setPage(1)
  }

  function onRoleChange(value: StaffRole | '') {
    setRole(value)
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

  // Client-side only — the search box filters the current page rather than
  // hitting the server, since the API has no free-text search on staff.
  const visible = data?.items.filter((s) =>
    !search || s.fullName.toLowerCase().includes(search.toLowerCase())
    || s.email.toLowerCase().includes(search.toLowerCase()))

  return (
    <PageContainer size="xl">
      <PageHeader
        title="Staff"
        description={data ? `${data.totalCount} registered` : 'Loading…'}
        actions={<CreateStaffDialog />}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <select
          className="h-8 rounded-lg border border-input bg-muted/30 px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/50"
          value={role}
          onChange={(e) => onRoleChange(e.target.value as StaffRole | '')}
        >
          <option value="">All roles</option>
          {STAFF_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          className="h-8 rounded-lg border border-input bg-muted/30 px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/50"
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

      {error && <ErrorBanner error={error} />}

      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pr-8">Staff no.</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Account status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && [0, 1, 2, 3].map((i) => (
              <TableRow key={i}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                ))}
              </TableRow>
            ))}

            {visible?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState
                    icon={Users}
                    message={search ? `No staff match "${search}".` : 'No staff registered yet.'}
                  />
                </TableCell>
              </TableRow>
            )}

            {visible?.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell className="pr-8 font-mono text-xs">{staff.staffNumber}</TableCell>
                <TableCell className="font-medium">
                  {staff.fullName}
                  {staff.licenseNumber && (
                    <div className="text-xs font-normal text-muted-foreground">{staff.licenseNumber}</div>
                  )}
                </TableCell>
                <TableCell>{staff.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{staff.role}</Badge>
                  {staff.specialization && (
                    <div className="mt-1 ml-2 text-xs text-muted-foreground">{staff.specialization}</div>
                  )}
                </TableCell>
                <TableCell>{staff.contactNumber ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(staff.accountStatus)}>{staff.accountStatus}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    {staff.accountStatus !== 'Active' && (
                      <Button size="sm" disabled={activate.isPending} onClick={() => onActivate(staff.id)}>
                        Activate
                      </Button>
                    )}
                    {staff.accountStatus !== 'Suspended' && (
                      <Button size="sm" variant="outline" disabled={suspend.isPending}
                        onClick={() => onSuspend(staff.id)}>
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
    </PageContainer>
  )
}
