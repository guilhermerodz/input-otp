'use client'

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import React from 'react'

export function ClientComp() {
  const [value, setValue] = React.useState('')

  return (
    <form className="container relative flex-1 flex flex-col justify-center items-center">
      <InputOTP
        value={value}
        onChange={setValue}
        maxLength={6}
        render={({ slots }) => (
          <>
            <InputOTPGroup>
              {slots.slice(0, 3).map((slot, index) => (
                <InputOTPSlot key={index} {...slot} />
              ))}{' '}
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              {slots.slice(3).map((slot, index) => (
                <InputOTPSlot key={index} {...slot} />
              ))}
            </InputOTPGroup>
          </>
        )}
      />
    </form>
  )
}
