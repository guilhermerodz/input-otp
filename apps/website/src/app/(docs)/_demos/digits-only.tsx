'use client'

import { OTPInput, REGEXP_ONLY_DIGITS } from 'input-otp'

import { Slot } from '@/components/ui/otp-slot'

export function DigitsOnlyDemo() {
  return (
    <OTPInput
      maxLength={6}
      pattern={REGEXP_ONLY_DIGITS}
      inputMode="numeric"
      containerClassName="group flex items-center"
      render={({ slots }) => (
        <div className="flex">
          {slots.map((slot, idx) => (
            <Slot key={idx} {...slot} />
          ))}
        </div>
      )}
    />
  )
}
