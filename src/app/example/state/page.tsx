'use client'

import * as React from 'react'
import * as OTPInput from '../../component'
import { cn } from '../../util/cn'

export default function ExampleState() {
  const [otpInputValue, setOtpInputValue] = React.useState<string>('123123')

  function onSubmit() {
    window.alert(otpInputValue)
  }

  return (
    <form onSubmit={onSubmit}>
      <OTPInput.Root
        maxLength={6}
        value={otpInputValue}
        onChange={setOtpInputValue}
        regexp={null}
        render={({ slots }) => (
          <OTPInput.Trigger>
            <div className="flex gap-2">
              {slots.map((slot, slotIdx) => (
                <div
                  key={slotIdx}
                  className={cn(
                    'w-10 h-14 flex items-center justify-center border-black border rounded-md',
                    { 'border-[2px] border-blue-300': slot.isActive },
                  )}
                >
                  {slot.char}
                </div>
              ))}
            </div>
          </OTPInput.Trigger>
        )}
      />
    </form>
  )
}