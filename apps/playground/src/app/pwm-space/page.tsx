'use client'

import * as React from 'react'

import { BaseOTPInput } from '@/components/base-input'

export default function Page() {
  return (
    <div className="container relative flex-1 flex flex-col justify-center items-center gap-10">
      {/* Plenty of room to the right: the badge gutter fits, so the push applies. */}
      <div data-testid="roomy">
        <BaseOTPInput />
      </div>

      {/* A scroll container with only 8px of slack: pushing the badge would
          grow a horizontal scrollbar and shift the layout, so it must not. */}
      <div data-testid="tight" className="w-fit overflow-x-auto p-2">
        <BaseOTPInput />
      </div>
    </div>
  )
}
