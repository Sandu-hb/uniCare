import { Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
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
import { ROLES } from '@/config/roles'
import { useAuth } from '@/features/auth/auth-context'
import type { AccountStatus } from '@/features/auth/types'
import { getApiErrorMessage } from '@/lib/api-client'
import { CreateStudentDialog } from './components/CreateStudentDialog'
import { useActivateStudent, useStudentAccounts, useSuspendStudent } from './hooks'

const PAGE_SIZE = 10

function statusVariant(status: AccountStatus) {
  if (status === 'Active') return 'default' as const
  if (status === 'Suspended') return 'destructive' as const
  return 'secondary' as const
}

export function StudentsPage() {
  const { hasRole } = useAuth()
  const isAdmin = hasRole(ROLES.Admin)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<AccountStatus | ''>('')
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
    setPage(1)   // a new search must start at page 1, or you land on an empty page
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
    <PageContainer size="xl">
      <PageHeader
        title="Students"
        description={data ? `${data.totalCount} registered` : 'Loading…'}
        actions={isAdmin && <CreateStudentDialog />}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name or registration number…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
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
              <TableHead>Registration</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Faculty</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Year</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Account status</TableHead>
              {isAdmin && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && [0, 1, 2, 3].map((i) => (
              <TableRow key={i}>
                {Array.from({ length: isAdmin ? 8 : 7 }).map((_, j) => (
                  <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                ))}
              </TableRow>
            ))}

            {data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 8 : 7}>
                  <EmptyState
                    icon={Users}
                    message={search ? `No students match "${search}".` : 'No students registered yet.'}
                  />
                </TableCell>
              </TableRow>
            )}

            {data?.items.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-mono text-xs">{student.registrationNumber}</TableCell>
                <TableCell className="font-medium">
                  <Link
                    to={`/students/${student.id}/medical-profile`}
                    className="hover:underline"
                  >
                    {student.fullName}
                  </Link>
                </TableCell>
                <TableCell>{student.faculty}</TableCell>
                <TableCell>{student.department}</TableCell>
                <TableCell className="text-right tabular-nums">{student.academicYear}</TableCell>
                <TableCell><Badge variant="secondary">{student.gender}</Badge></TableCell>
                <TableCell>
                  <Badge variant={statusVariant(student.accountStatus)}>{student.accountStatus}</Badge>
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {student.accountStatus !== 'Active' && (
                        <Button size="sm" disabled={activate.isPending} onClick={() => onActivate(student.id)}>
                          Activate
                        </Button>
                      )}
                      {student.accountStatus !== 'Suspended' && (
                        <Button size="sm" variant="outline" disabled={suspend.isPending}
                          onClick={() => onSuspend(student.id)}>
                          Suspend
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
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
