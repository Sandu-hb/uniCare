import { NavLink, Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { ROLES } from '@/config/roles'
import { useAuth } from '@/features/auth/auth-context'

// TODO(auth): the non-admin-only links below still show to every staff role —
// only the admin-only one is filtered so far.
const links = [
  { to: '/students', label: 'Students' },
  { to: '/staff/appointments', label: 'Appointments' },
  { to: '/staff/student-accounts', label: 'Student approvals', roles: [ROLES.Admin] },
  { to: '/system-status', label: 'System status' },
]

export function StaffLayout() {
  const { hasRole } = useAuth()
  const visibleLinks = links.filter((link) => !link.roles || hasRole(...link.roles))

  return (
    <div className="flex min-h-svh bg-background">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border p-4">
        <div className="mb-6 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">UniCare</p>
        </div>
        <nav className="flex flex-col gap-1">
          {visibleLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-accent font-medium text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-border pt-4">
          <ThemeToggle />
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
