'use client'

import React from 'react'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from './shadcn-input'

export default function ShadcnPage() {
  const [value, setValue] = React.useState('')

  return (
    <div className="container relative flex-1 flex flex-col justify-center items-center">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        maxLength={6}
        onInput={e => {
          window.alert(e.currentTarget.value)
        }}
      />
      <InputOTP
        value={value}
        onChange={setValue}
        // onInput={e => {
        //   window.alert(e.currentTarget.value)
        // }}
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
    </div>
  )
}
