'use client'

import { OTPInput } from 'input-otp'

import { Slot } from '@/components/ui/otp-slot'

export function PlaceholderDemo() {
  return (
    <OTPInput
      maxLength={6}
      placeholder="000000"
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
