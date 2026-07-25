'use client'

import { OTPInput } from 'input-otp'

import { FakeDash, Slot } from '@/components/ui/otp-slot'

export function GroupsDemo() {
  return (
    <OTPInput
      maxLength={6}
      containerClassName="group flex items-center has-[:disabled]:opacity-40"
      render={({ slots }) => (
        <>
          <div className="flex">
            {slots.slice(0, 3).map((slot, idx) => (
              <Slot key={idx} {...slot} />
            ))}
          </div>

          <FakeDash />

          <div className="flex">
            {slots.slice(3).map((slot, idx) => (
              <Slot key={idx} {...slot} />
            ))}
          </div>
        </>
      )}
    />
  )
}
