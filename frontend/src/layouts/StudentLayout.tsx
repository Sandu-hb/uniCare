import { Outlet } from 'react-router-dom'

/**
 * Shell for student-facing pages.
 * TODO(ui): add the top nav — profile, appointments, prescriptions, reports.
 */
export function StudentLayout() {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border px-6 py-4">
        <p className="text-sm font-semibold">UniCare</p>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
