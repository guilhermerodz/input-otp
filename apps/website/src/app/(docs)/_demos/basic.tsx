'use client'

import { OTPInput } from 'input-otp'

import { Slot } from '@/components/ui/otp-slot'

export function BasicDemo() {
  return (
    <OTPInput
      maxLength={6}
      containerClassName="group flex items-center has-[:disabled]:opacity-40"
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
