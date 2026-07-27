'use client'

import * as React from 'react'
import { OTPInput } from 'input-otp'

import { cn } from '@/lib/utils'
import { FakeCaret } from '@/components/ui/otp-slot'

const CORRECT_CODE = '123456'

export function InvalidDemo() {
  const [value, setValue] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  return (
    <div className="flex flex-col items-center gap-4">
      <OTPInput
        value={value}
        onChange={next => {
          setValue(next)
          // Clear the error as soon as the user starts fixing it.
          if (error) setError(null)
        }}
        onComplete={code => {
          if (code !== CORRECT_CODE) {
            setError('That code is incorrect. Try 123456.')
          }
        }}
        maxLength={6}
        aria-invalid={error !== null}
        aria-describedby={error ? 'otp-error' : undefined}
        containerClassName={cn(
          'group flex items-center',
          error && 'motion-safe:animate-[otp-shake_450ms_ease-in-out]',
        )}
        render={({ slots }) => (
          <div className="flex">
            {slots.map((slot, idx) => (
              <div
                key={idx}
                className={cn(
                  'relative flex h-14 w-12 items-center justify-center text-[1.375rem] font-medium tabular-nums transition-all duration-200',
                  'border-y border-r bg-background/40 first:rounded-l-md first:border-l last:rounded-r-md',
                  'outline outline-0 outline-offset-0',
                  error
                    ? 'border-destructive/60 text-destructive-foreground outline-destructive/70'
                    : 'border-border text-foreground outline-foreground/80 group-focus-within:border-foreground/25',
                  slot.isActive && 'z-10 outline-2',
                )}
              >
                {slot.char}
                {slot.hasFakeCaret && <FakeCaret />}
              </div>
            ))}
          </div>
        )}
      />

      <p
        id="otp-error"
        role="alert"
        className={cn(
          'text-sm transition-opacity duration-150',
          error ? 'text-red-400 opacity-100' : 'opacity-0',
        )}
      >
        {error ?? 'placeholder'}
      </p>
    </div>
  )
}
