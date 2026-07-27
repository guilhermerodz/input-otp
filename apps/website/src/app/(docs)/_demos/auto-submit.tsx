'use client'

import * as React from 'react'
import { OTPInput } from 'input-otp'

import { Slot } from '@/components/ui/otp-slot'

export function AutoSubmitDemo() {
  const formRef = React.useRef<HTMLFormElement>(null)
  const [status, setStatus] = React.useState<'idle' | 'verifying' | 'done'>(
    'idle',
  )

  return (
    <form
      ref={formRef}
      onSubmit={async e => {
        e.preventDefault()
        setStatus('verifying')
        await new Promise(resolve => setTimeout(resolve, 900))
        setStatus('done')
      }}
      className="flex flex-col items-center gap-5"
    >
      <OTPInput
        name="code"
        maxLength={6}
        autoFocus={false}
        disabled={status !== 'idle'}
        // Fires exactly once, on the transition into a full value — including
        // when the value arrives all at once from a paste or an SMS autofill.
        onComplete={() => formRef.current?.requestSubmit()}
        containerClassName="group flex items-center has-[:disabled]:opacity-50"
        render={({ slots }) => (
          <div className="flex">
            {slots.map((slot, idx) => (
              <Slot key={idx} {...slot} />
            ))}
          </div>
        )}
      />

      <p className="h-5 text-sm text-muted-foreground" aria-live="polite">
        {status === 'idle' && 'Type six characters — no submit button needed.'}
        {status === 'verifying' && 'Verifying…'}
        {status === 'done' && (
          <span className="text-emerald-400">Submitted.</span>
        )}
      </p>

      {status === 'done' && (
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          Reset
        </button>
      )}
    </form>
  )
}
