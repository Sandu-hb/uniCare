import { Activity, LogOut } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/auth-context'
import { useMyStudent } from '@/features/students/hooks'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}

function NavPill({ to, label, disabled }: { to?: string; label: string; disabled?: boolean }) {
  if (disabled || !to) {
    return (
      <span className="flex h-9 cursor-not-allowed items-center rounded-full px-3.5 text-[13.5px] font-medium text-muted-foreground/50">
        {label}
      </span>
    )
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex h-9 items-center rounded-full px-3.5 text-[13.5px] transition-colors ${
          isActive ? 'bg-muted font-semibold text-foreground' : 'font-medium text-muted-foreground hover:text-foreground'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

export function StudentLayout() {
  const { user, logout } = useAuth()
  const { data: student } = useMyStudent()

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-border bg-card px-10">
        <div className="flex items-center gap-9">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-[9px] bg-primary">
              <Activity className="size-[17px] text-primary-foreground" />
            </div>
            <span className="text-[15px] font-semibold">UniCare</span>
          </div>

          <nav className="flex items-center gap-1">
            <NavPill to="/student" label="Dashboard" />
            <NavPill to="/student/medical-profile" label="Medical Profile" />
            <NavPill to="/student/documents" label="Documents" />
            <NavPill to="/student/appointments" label="Appointments" />
            <NavPill label="Prescriptions" disabled />
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
              {initials(user?.fullName ?? '')}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[12.5px] font-semibold">{user?.fullName}</span>
              <span className="text-[10.5px] text-muted-foreground">{student?.registrationNumber ?? ''}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            aria-label="Sign out"
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
