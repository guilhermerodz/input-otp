'use client'

import { OTPInput } from 'input-otp'

import { Slot } from '@/components/ui/otp-slot'

/**
 * The field is a real <input>, so it takes a real <label>. Clicking the label
 * focuses it and a screen reader announces the name — no ARIA gymnastics.
 */
export function LabelledDemo() {
  return (
    <div className="flex flex-col items-center gap-3">
      <label
        htmlFor="verification-code"
        className="text-sm font-medium text-foreground"
      >
        Verification code
      </label>

      <OTPInput
        id="verification-code"
        name="code"
        maxLength={6}
        aria-describedby="verification-code-hint"
        containerClassName="group flex items-center"
        render={({ slots }) => (
          <div className="flex">
            {slots.map((slot, idx) => (
              <Slot key={idx} {...slot} />
            ))}
          </div>
        )}
      />

      <p id="verification-code-hint" className="text-sm text-muted-foreground">
        Enter the 6-character code we sent to your phone.
      </p>
    </div>
  )
}
