'use client'

import { OTPInput } from 'input-otp'

import { cn } from '@/lib/utils'

/** No boxes: a rule under each character, thicker where the caret is. */
export function UnderlinedDemo() {
  return (
    <OTPInput
      maxLength={6}
      containerClassName="group flex items-center"
      render={({ slots }) => (
        <div className="flex gap-3">
          {slots.map((slot, idx) => (
            <div
              key={idx}
              className="relative flex h-12 w-9 items-end justify-center pb-2"
            >
              <span className="text-xl font-medium tabular-nums text-foreground">
                {slot.char}
              </span>

              {slot.isActive && slot.char === null && (
                <span className="absolute bottom-3 h-5 w-px bg-foreground motion-safe:animate-caret-blink" />
              )}

              <span
                className={cn(
                  'absolute inset-x-0 bottom-0 h-px transition-all duration-200',
                  slot.isActive
                    ? 'h-0.5 bg-foreground'
                    : slot.char !== null
                      ? 'bg-foreground/40'
                      : 'bg-border',
                )}
              />
            </div>
          ))}
        </div>
      )}
    />
  )
}
