'use client'

import * as React from 'react'

import { BaseOTPInput } from '@/components/base-input'

export default function Page() {
  return (
    <div className="container relative flex-1 flex flex-col justify-center items-center">
      <BaseOTPInput />

      {/* Editable for testing copy-pasting into input */}
      <div data-testid="random-text" className="mt-10 absolute h-px w-px" contentEditable></div>
    </div>
  )
}
