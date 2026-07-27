'use client'

import * as React from 'react'
import { OTPInput } from 'input-otp'

import { Slot } from '@/components/ui/otp-slot'

export function ControlledDemo() {
  const [value, setValue] = React.useState('')

  return (
    <div className="flex flex-col items-center gap-5">
      <OTPInput
        value={value}
        onChange={setValue}
        maxLength={6}
        containerClassName="group flex items-center"
        render={({ slots }) => (
          <div className="flex">
            {slots.map((slot, idx) => (
              <Slot key={idx} {...slot} />
            ))}
          </div>
        )}
      />

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>
          value:{' '}
          <code className="font-mono text-foreground">
            {value === '' ? '""' : `"${value}"`}
          </code>
        </span>
        <button
          type="button"
          onClick={() => setValue('')}
          className="rounded-md border border-border px-2 py-1 text-xs transition-colors duration-150 hover:bg-foreground/5 hover:text-foreground"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => setValue('123456')}
          className="rounded-md border border-border px-2 py-1 text-xs transition-colors duration-150 hover:bg-foreground/5 hover:text-foreground"
        >
          Fill
        </button>
      </div>
    </div>
  )
}
