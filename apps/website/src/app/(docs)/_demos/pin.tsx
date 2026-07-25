'use client'

import { OTPInput, REGEXP_ONLY_DIGITS } from 'input-otp'

import { cn } from '@/lib/utils'
import { FakeCaret } from '@/components/ui/otp-slot'

/** A 4-digit PIN with gaps instead of a shared border. */
export function PinDemo() {
  return (
    <OTPInput
      maxLength={4}
      pattern={REGEXP_ONLY_DIGITS}
      containerClassName="group flex items-center"
      render={({ slots }) => (
        <div className="flex gap-3">
          {slots.map((slot, idx) => (
            <div
              key={idx}
              className={cn(
                'relative flex h-14 w-14 items-center justify-center rounded-xl',
                'border border-border bg-background/40 text-2xl font-medium tabular-nums',
                'transition-all duration-200',
                slot.isActive &&
                  'border-foreground/50 bg-foreground/[0.04] shadow-[0_0_0_3px_hsl(0_0%_100%/0.06)]',
              )}
            >
              {slot.char}
              {slot.hasFakeCaret && <FakeCaret />}
            </div>
          ))}
        </div>
      )}
    />
  )
}
