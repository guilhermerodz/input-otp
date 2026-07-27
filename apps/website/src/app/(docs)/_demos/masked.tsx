'use client'

import * as React from 'react'
import { OTPInput } from 'input-otp'

import { cn } from '@/lib/utils'
import { FakeCaret } from '@/components/ui/otp-slot'

/**
 * Masking is a rendering concern: the value stays intact, the slot just draws a
 * dot instead of the character. A reveal toggle is one boolean away.
 */
export function MaskedDemo() {
  const [revealed, setRevealed] = React.useState(false)

  return (
    <div className="flex flex-col items-center gap-5">
      <OTPInput
        maxLength={6}
        containerClassName="group flex items-center"
        render={({ slots }) => (
          <div className="flex">
            {slots.map((slot, idx) => (
              <div
                key={idx}
                className={cn(
                  'relative flex h-14 w-12 items-center justify-center',
                  'border-y border-r border-border bg-background/40 text-[1.375rem] font-medium tabular-nums text-foreground',
                  'first:rounded-l-md first:border-l last:rounded-r-md',
                  'outline outline-0 outline-foreground/80 transition-all duration-200',
                  slot.isActive && 'z-10 outline-2',
                )}
              >
                {slot.char !== null && (
                  <span
                    className={cn(!revealed && 'text-[1.75rem] leading-none')}
                  >
                    {revealed ? slot.char : '•'}
                  </span>
                )}
                {slot.hasFakeCaret && <FakeCaret />}
              </div>
            ))}
          </div>
        )}
      />

      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={revealed}
          onChange={e => setRevealed(e.target.checked)}
          className="h-3.5 w-3.5 accent-foreground"
        />
        Reveal code
      </label>
    </div>
  )
}
