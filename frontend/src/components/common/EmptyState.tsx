import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  message: string
  icon?: LucideIcon
  className?: string
}

/**
 * Centered icon + message for empty lists/queues/tables, replacing ad hoc
 * single-line muted text that was hand-written per page.
 */
export function EmptyState({ message, icon: Icon = Inbox, className }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground ${className ?? ''}`}>
      <Icon className="size-8 text-muted-foreground/50" />
      {message}
    </div>
  )
}
