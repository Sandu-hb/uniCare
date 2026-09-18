import { Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { getApiErrorMessage } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { useOwnSessionDetail, useSendCounselingMessage, useStartOrResumeSession } from './hooks'

export function WellnessPage() {
  const [sessionId, setSessionId] = useState('')
  const [draft, setDraft] = useState('')
  const startSession = useStartOrResumeSession()
  const { data: session, isPending: sessionPending } = useOwnSessionDetail(sessionId)
  const sendMessage = useSendCounselingMessage(sessionId)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    startSession.mutate(undefined, { onSuccess: (data) => setSessionId(data.id) })
    // Only ever run once per page visit — starting/resuming is idempotent server-side.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [session?.messages.length])

  function handleSend() {
    const content = draft.trim()
    if (!content || sendMessage.isPending) return
    setDraft('')
    sendMessage.mutate(content)
  }

  const loading = startSession.isPending || (Boolean(sessionId) && sessionPending)

  return (
    <div className="mx-auto flex h-[calc(100svh-68px)] max-w-3xl flex-col p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Wellness Chat</h1>
        <p className="text-sm text-muted-foreground">
          A private, judgement-free space to talk things through. This is first-line support,
          not a replacement for a clinician — the assistant will point you to real help when it matters.
        </p>
      </div>

      {(startSession.isError || sendMessage.isError) && (
        <p className="mb-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {getApiErrorMessage(startSession.error ?? sendMessage.error)}
        </p>
      )}

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardContent className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}

          {!loading && session?.messages.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Say hello whenever you're ready — nothing you share here leaves this conversation
              unless it's something the university's counselling team needs to know to keep you safe.
            </p>
          )}

          {session?.messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.role === 'Student' ? 'justify-end' : 'justify-start',
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm',
                  message.role === 'Student'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground',
                )}
              >
                {message.content}
              </div>
            </div>
          ))}

          {sendMessage.isPending && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl bg-muted px-3.5 py-2 text-sm text-muted-foreground">
                …
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </CardContent>

        <div className="flex items-end gap-2 border-t border-border p-3">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Type a message…"
            disabled={!sessionId || sendMessage.isPending}
            maxLength={2000}
            className="min-h-10 resize-none"
          />
          <Button
            type="button"
            size="icon"
            onClick={handleSend}
            disabled={!sessionId || !draft.trim() || sendMessage.isPending}
          >
            <Send className="size-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
