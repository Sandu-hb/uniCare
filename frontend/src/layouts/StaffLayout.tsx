import {
  Activity, Calendar, FlaskConical, HeartPulse, Home, ListOrdered, LogOut, Menu, Pill,
  Users, X, type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { ROLES, type Role } from '@/config/roles'
import { useAuth } from '@/features/auth/auth-context'
import { useStudentAccounts } from '@/features/students/hooks'

interface NavItem {
  to?: string
  label: string
  icon: LucideIcon
  roles?: Role[]
}

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  { title: 'Overview', items: [{ to: '/staff', label: 'Dashboard', icon: Home }] },
  {
    title: 'Patient Care',
    items: [
      { to: '/students', label: 'Students', icon: Users },
      { to: '/staff/appointments', label: 'Appointments', icon: Calendar, roles: [ROLES.Admin] },
      {
        to: '/staff/queue', label: 'Doctor queue', icon: ListOrdered,
        roles: [ROLES.Doctor, ROLES.Admin],
      },
      {
        to: '/staff/lab-queue', label: 'Laboratory queue', icon: FlaskConical,
        roles: [ROLES.LabStaff, ROLES.Admin],
      },
      {
        to: '/staff/pharmacy-queue', label: 'Pharmacy queue', icon: Pill,
        roles: [ROLES.PharmacyStaff, ROLES.Admin],
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      { to: '/system-status', label: 'System status', icon: Activity },
      { to: '/staff/wellness-alerts', label: 'Wellness alerts', icon: HeartPulse, roles: [ROLES.Admin] },
    ],
  },
]

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}

export function StaffLayout() {
  const { user, hasRole, logout } = useAuth()
  const isAdmin = hasRole(ROLES.Admin)
  const { data: pending } = useStudentAccounts({ status: 'PendingApproval', pageSize: 1 }, isAdmin)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const primaryRole = user?.roles.find((r) => r !== ROLES.Student) ?? user?.roles[0] ?? ''

  return (
    <div className="flex min-h-svh bg-background">
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 shadow-sm md:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Menu className="size-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-[8px] bg-primary">
            <Activity className="size-4 text-primary-foreground" />
          </div>
          <span className="text-[14px] font-semibold">UniCare</span>
        </div>
        <div className="size-9" />
      </div>

      {sidebarOpen && (
        <div
          aria-hidden
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-border bg-muted/40 p-4 shadow-xl transition-transform duration-200 md:static md:z-auto md:translate-x-0 md:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-2.5 px-1.5 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary">
              <Activity className="size-[19px] text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[15px] font-semibold">UniCare</span>
              <span className="text-[10.5px] text-muted-foreground">Medical Centre</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mb-5 flex items-center gap-2.5 rounded-[14px] border border-border bg-card p-2.5">
          <div className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-accent text-[12.5px] font-semibold text-accent-foreground">
            {initials(user?.fullName ?? '')}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[13px] font-semibold">{user?.fullName}</span>
            <span className="text-[11px] font-semibold text-primary">{primaryRole}</span>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-[18px] overflow-y-auto">
          {NAV_SECTIONS.map((section) => {
            const items = section.items.filter((item) => !item.roles || hasRole(...item.roles))
            if (items.length === 0) return null

            return (
              <div key={section.title} className="flex flex-col gap-0.5">
                <span className="mb-1.5 px-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </span>
                {items.map((item) => {
                  const Icon = item.icon
                  const badge = item.label === 'Students' && isAdmin ? pending?.totalCount : undefined

                  if (!item.to) {
                    return (
                      <div
                        key={item.label}
                        className="flex cursor-not-allowed items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13.5px] font-medium text-muted-foreground/50"
                      >
                        <Icon className="size-[18px]" />
                        {item.label}
                      </div>
                    )
                  }

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/staff'}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between gap-2.5 rounded-[10px] px-2.5 py-2 text-[13.5px] font-medium transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                        }`
                      }
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="size-[18px]" />
                        {item.label}
                      </span>
                      {Boolean(badge) && (
                        <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10.5px] font-bold text-primary-foreground">
                          {badge}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            )
          })}
        </nav>

        <div className="flex items-center justify-between border-t border-border pt-3.5">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => void logout()}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12.5px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-[15px]" />
            Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-y-auto pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  )
}
