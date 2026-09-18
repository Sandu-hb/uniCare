import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

/**
 * The `<h1 className="text-2xl font-semibold">…` + description block used at
 * the top of nearly every page, with an optional right-aligned actions slot.
 */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={`mb-6 flex flex-wrap items-start justify-between gap-3 ${className ?? ''}`}>
      <div>
        <h1 className="font-heading text-2xl font-semibold">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
