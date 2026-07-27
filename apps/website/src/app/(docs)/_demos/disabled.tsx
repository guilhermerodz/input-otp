'use client'

import * as React from 'react'
import { OTPInput } from 'input-otp'

import { Slot } from '@/components/ui/otp-slot'

export function DisabledDemo() {
  // Held in state only so the demo can show a pre-filled field.
  const [partial, setPartial] = React.useState('042')
  const [complete, setComplete] = React.useState('314159')

  return (
    <div className="flex flex-col items-center gap-6">
      {/* `has-[:disabled]` reads the state off the real input, so the whole
          field dims without any extra prop threading. */}
      <OTPInput
        disabled
        maxLength={6}
        value={partial}
        onChange={setPartial}
        containerClassName="group flex items-center has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-40"
        render={({ slots }) => (
          <div className="flex">
            {slots.map((slot, idx) => (
              <Slot key={idx} {...slot} />
            ))}
          </div>
        )}
      />

      <OTPInput
        readOnly
        maxLength={6}
        value={complete}
        onChange={setComplete}
        containerClassName="group flex items-center has-[:read-only]:cursor-default"
        render={({ slots }) => (
          <div className="flex">
            {slots.map((slot, idx) => (
              <Slot key={idx} {...slot} />
            ))}
          </div>
        )}
      />
    </div>
  )
}
