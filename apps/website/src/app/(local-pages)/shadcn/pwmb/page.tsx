'use client'

import {
  InputOTP,
  InputOTPGroup,
  InputOTPRenderSlot,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp'
import React from 'react'

export default function ShadcnPage() {
  const [value, setValue] = React.useState('')

  return (
    <form className="container relative flex-1 flex flex-col justify-center items-center">
      {/* <input
        // test pwmb
        type="text"
        autoComplete="username webauthn"
        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
      /> */}
      <InputOTP
        autoFocus
        // test pwmb
        type="text"
        autoComplete="username webauthn"
        pushPasswordManagerStrategy="experimental-no-flickering"
        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
        //
        // value={value}
        // onChange={setValue}
        maxLength={6}
        render={({ slots }) => (
          <>
            <InputOTPGroup>
              {slots.slice(0, 3).map((slot, index) => (
                <InputOTPRenderSlot key={index} {...slot} />
              ))}
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              {slots.slice(3).map((slot, index) => (
                <InputOTPRenderSlot key={index} {...slot} />
              ))}
            </InputOTPGroup>
          </>
        )}
      />

      <input type="submit" hidden />
    </form>
  )
}
