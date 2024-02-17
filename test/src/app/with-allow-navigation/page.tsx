'use client'

import * as React from 'react'

import { BaseOTPInput } from '@/components/base-input'

export default function Page() {
  return (
    <div className="container relative flex-1 flex flex-col justify-center items-center">
      <BaseOTPInput data-testid="otp-input-wrapper-1" allowNavigation={true} />
      <BaseOTPInput data-testid="otp-input-wrapper-2" allowNavigation={false} />
    </div>
  )
}
