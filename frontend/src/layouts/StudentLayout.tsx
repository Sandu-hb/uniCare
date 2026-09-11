import { NavLink, Outlet } from 'react-router-dom'
import { ROUTES } from '@/config/routes'

/**
 * Shell for student-facing pages.
 * TODO(ui): add the rest of the top nav — profile, prescriptions, reports.
 */
export function StudentLayout() {
  return (
    <div className="min-h-svh bg-background">
      <header className="flex items-center gap-6 border-b border-border px-6 py-4">
        <p className="text-sm font-semibold">UniCare</p>
        <NavLink
          to={ROUTES.student.appointments}
          className={({ isActive }) =>
            `text-sm transition-colors ${
              isActive ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`
          }
        >
          Appointments
        </NavLink>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
