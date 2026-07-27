'use client'

import * as React from 'react'
import { OTPInput, REGEXP_ONLY_DIGITS } from 'input-otp'

import { cn } from '@/lib/utils'
import { Slot } from '@/components/ui/otp-slot'

const CORRECT_CODE = '424242'
const RESEND_SECONDS = 30

/**
 * The whole flow in one component: label, hint, auto-submit on completion,
 * pending state, error handling with focus recovery, and a resend cooldown.
 */
export function VerifyCardDemo() {
  const [value, setValue] = React.useState('')
  const [status, setStatus] = React.useState<'idle' | 'pending' | 'success'>(
    'idle',
  )
  const [error, setError] = React.useState<string | null>(null)
  const [cooldown, setCooldown] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (cooldown === 0) return
    const timer = setTimeout(() => setCooldown(s => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  async function verify(code: string) {
    setStatus('pending')
    await new Promise(resolve => setTimeout(resolve, 800))

    if (code === CORRECT_CODE) {
      setStatus('success')
      return
    }

    setStatus('idle')
    setError('That code is incorrect. Try 424242.')
    setValue('')
    inputRef.current?.focus()
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-border/70 bg-background/60 p-6 shadow-[0_20px_60px_-30px_rgb(0_0_0/0.8)]">
      <h3 className="text-base font-semibold tracking-tight text-foreground">
        Check your phone
      </h3>
      <p id="verify-hint" className="mt-1 text-sm text-muted-foreground">
        We sent a 6-digit code to{' '}
        <span className="text-foreground">•••• 4417</span>.
      </p>

      <form
        className="mt-5 flex flex-col items-center gap-4"
        onSubmit={e => {
          e.preventDefault()
          verify(value)
        }}
      >
        <label htmlFor="verify-code" className="sr-only">
          Verification code
        </label>

        <OTPInput
          ref={inputRef}
          id="verify-code"
          name="code"
          value={value}
          onChange={next => {
            setValue(next)
            if (error) setError(null)
          }}
          onComplete={verify}
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS}
          disabled={status !== 'idle'}
          aria-describedby={error ? 'verify-hint verify-error' : 'verify-hint'}
          aria-invalid={error !== null}
          containerClassName={cn(
            'group flex items-center has-[:disabled]:opacity-50',
            error && 'motion-safe:animate-[otp-shake_450ms_ease-in-out]',
          )}
          render={({ slots }) => (
            <div className="flex">
              {slots.map((slot, idx) => (
                <Slot
                  key={idx}
                  {...slot}
                  className={cn(
                    'h-12 w-10 text-lg',
                    error && 'border-destructive/60',
                  )}
                />
              ))}
            </div>
          )}
        />

        <p aria-live="polite" className="min-h-5 text-center text-xs leading-5">
          {error && (
            <span id="verify-error" role="alert" className="text-red-400">
              {error}
            </span>
          )}
          {status === 'pending' && (
            <span className="text-muted-foreground">Verifying…</span>
          )}
          {status === 'success' && (
            <span className="text-emerald-400">Verified. Signing you in…</span>
          )}
        </p>

        <button
          type="button"
          disabled={cooldown > 0 || status !== 'idle'}
          onClick={() => setCooldown(RESEND_SECONDS)}
          className="text-xs text-muted-foreground underline decoration-border underline-offset-4 transition-colors duration-150 hover:text-foreground disabled:no-underline disabled:opacity-50"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </button>
      </form>
    </div>
  )
}
