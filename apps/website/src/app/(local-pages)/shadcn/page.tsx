'use client'

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import React from 'react'

export default function ShadcnPage() {
  const [value, setValue] = React.useState('')

  return (
    <form className="container relative flex-1 flex flex-col justify-center items-center">
      {/* With Context API */}
      <InputOTP value={value} onChange={setValue} maxLength={6}>
        <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>

      {/* Previously with render={() => {}} prop (still supported through official lib) */}
      {/* <InputOTP
        value={value}
        onChange={setValue}
        maxLength={6}
        render={({ slots }) => (
          <>
            <InputOTPGroup>
              {slots.slice(0, 3).map((slot, index) => (
                <InputOTPSlot key={index} {...slot} />
              ))}
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              {slots.slice(3).map((slot, index) => (
                <InputOTPSlot key={index} {...slot} />
              ))}
            </InputOTPGroup>
          </>
        )}
      /> */}
    </form>
  )
}
