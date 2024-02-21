'use client'

import * as React from 'react'

import { BaseOTPInput } from '@/components/base-input'

export default function Page() {
  const [disabled, setDisabled] = React.useState(false)

  return (
    <div className="container relative flex-1 flex flex-col justify-center items-center">
      <BaseOTPInput onComplete={() => setDisabled(true)} disabled={disabled} />
    </div>
  )
}
