'use client'

import * as React from 'react'

import { BaseOTPInput } from '@/components/base-input'

export default function Page() {
  return (
    <div className="container relative flex-1 flex flex-col justify-center items-center">
      <BaseOTPInput data-testid="input-otp-wrapper-1" allowNavigation={true} />
      <BaseOTPInput data-testid="input-otp-wrapper-2" allowNavigation={false} />
    </div>
  )
}
