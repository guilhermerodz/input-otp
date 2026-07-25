'use client'

import { OTPInput, REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp'

import { Slot } from '@/components/ui/otp-slot'

export function AlphanumericDemo() {
  return (
    <OTPInput
      maxLength={6}
      pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
      // A numeric keypad can't type letters — ask for the full keyboard.
      inputMode="text"
      autoCapitalize="characters"
      containerClassName="group flex items-center"
      render={({ slots }) => (
        <div className="flex">
          {slots.map((slot, idx) => (
            <Slot key={idx} {...slot} className="uppercase" />
          ))}
        </div>
      )}
    />
  )
}
