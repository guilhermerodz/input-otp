'use client'

import * as React from 'react'

import { BaseOTPInput } from '@/components/base-input'

export default function Page() {
  return (
    <div className="container relative flex-1 flex flex-col justify-center items-center">
      <BaseOTPInput data-testid="otp-input-wrapper-1" disabled />
      <BaseOTPInput data-testid="otp-input-wrapper-2" inputMode='numeric' />
      <BaseOTPInput data-testid="otp-input-wrapper-3" inputMode='text' />
      <BaseOTPInput data-testid="otp-input-wrapper-4" containerClassName='testclassname' />
      <BaseOTPInput data-testid="otp-input-wrapper-5" maxLength={3} />
      <BaseOTPInput data-testid="otp-input-wrapper-6" id='testid' name='testname'  />
      <BaseOTPInput data-testid="otp-input-wrapper-7" regexp={/ /}  />
    </div>
  )
}
