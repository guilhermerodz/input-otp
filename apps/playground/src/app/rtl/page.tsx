'use client'

import * as React from 'react'

import { BaseOTPInput } from '@/components/base-input'

export default function Page() {
  return (
    <div
      dir="rtl"
      className="container relative flex-1 flex flex-col justify-center items-center"
    >
      <BaseOTPInput />
    </div>
  )
}
