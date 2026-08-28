import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getHealth, type HealthResponse } from '@/lib/api'

type Probe = 'checking' | 'up' | 'down'

function StatusRow({
  layer,
  detail,
  state,
}: {
  layer: string
  detail: string
  state: Probe
}) {
  const label = state === 'checking' ? 'Checking' : state === 'up' ? 'Connected' : 'Unreachable'
  const variant = state === 'up' ? 'default' : state === 'down' ? 'destructive' : 'secondary'

  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{layer}</p>
        <p className="truncate text-xs text-muted-foreground">{detail}</p>
      </div>
      <Badge variant={variant}>{label}</Badge>
    </div>
  )
}

export default function SystemStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const check = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setHealth(await getHealth())
    } catch (err) {
      setHealth(null)
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void check()
  }, [check])

  const apiState: Probe = loading ? 'checking' : health ? 'up' : 'down'
  const dbState: Probe = loading
    ? 'checking'
    : health?.database === 'connected'
      ? 'up'
      : 'down'

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">UniCare</CardTitle>
          <CardDescription>
            University Medical Center Digital Management System
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-4">
            <StatusRow layer="Frontend" detail="React 19 + Vite + Tailwind" state="up" />
            <StatusRow
              layer="API"
              detail={health ? `ASP.NET Core · ${health.environment}` : 'ASP.NET Core on :5054'}
              state={apiState}
            />
            <StatusRow layer="Database" detail="Neon PostgreSQL via EF Core" state={dbState} />
          </div>

          {error && (
            <p className="mb-4 rounded-md bg-destructive/10 p-3 text-xs text-destructive">
              {error} — is the backend running? Try{' '}
              <code className="font-mono">dotnet run</code> in <code className="font-mono">backend/UniCare.Api</code>.
            </p>
          )}

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {health ? new Date(health.timestamp).toLocaleTimeString() : '—'}
            </p>
            <Button onClick={() => void check()} disabled={loading} size="sm">
              {loading ? 'Checking…' : 'Re-check'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
