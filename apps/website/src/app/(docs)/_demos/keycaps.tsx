'use client'

import { OTPInput } from 'input-otp'

import { cn } from '@/lib/utils'

/** Tactile keycaps, with the character sliding in as it lands. */
export function KeycapsDemo() {
  return (
    <OTPInput
      maxLength={6}
      containerClassName="group flex items-center"
      render={({ slots }) => (
        <div className="flex gap-2">
          {slots.map((slot, idx) => (
            <div
              key={idx}
              className={cn(
                'relative flex h-16 w-12 items-center justify-center overflow-hidden rounded-lg',
                'border border-border bg-gradient-to-b from-white/[0.06] to-transparent',
                'shadow-[0_2px_6px_-2px_rgb(0_0_0/0.6),inset_0_1px_0_hsl(0_0%_100%/0.07)]',
                'transition-transform duration-150',
                slot.isActive && 'border-foreground/40 translate-y-px',
              )}
            >
              <span
                key={slot.char}
                className={cn(
                  'text-2xl font-semibold tabular-nums text-foreground',
                  slot.char !== null &&
                    'motion-safe:animate-[keycap-drop_220ms_cubic-bezier(0.22,1,0.36,1)]',
                )}
              >
                {slot.char}
              </span>

              {slot.hasFakeCaret && (
                <span className="absolute bottom-2 h-0.5 w-5 rounded-full bg-foreground motion-safe:animate-caret-blink" />
              )}
            </div>
          ))}
        </div>
      )}
    />
  )
}
