'use client'

import { cn } from '@/lib/utils'
import type { SlotProps } from '@lib/core'
import { OTPInput } from 'lib-dist'
import * as React from 'react'

export function ReactOTPInput(
  props: Partial<React.ComponentProps<typeof OTPInput>>,
) {
  const [value, setValue] = React.useState('')
  const [completedOnce, setCompletedOnce] = React.useState<string | undefined>(
    undefined,
  )
  // const regexp = /^(?:0|1)+$/
  return (
    <OTPInput
      name="react-input"
      // Additional props
      value={value}
      onChange={setValue}
      // onChange={v => {
      //   if (v.length > 0 && !regexp.test(v)) return
      //   console.log('regex has tested successfully for',v)
      //   setValue(v)
      // }}
      data-completed-once={completedOnce}
      onComplete={(v) => setCompletedOnce(v)}
      // pattern={regexp.source}

      // Mandatory props
      maxLength={6}
      containerClassName="group flex items-center has-[:disabled]:opacity-30"
      render={({ slots }) => (
        <>
          <div className="flex">
            {slots.slice(0, 3).map((slot, idx) => (
              <Slot key={idx} {...slot} />
            ))}
          </div>

          <FakeDash />

          <div className="flex">
            {slots.slice(3).map((slot, idx) => (
              <Slot key={idx} {...slot} />
            ))}
          </div>
        </>
      )}
      {...props}
    />
  )
}

// Feel free to copy. Uses @shadcn/ui tailwind colors.
function Slot(props: SlotProps) {
  return (
    <div
      data-slot
      data-test-char={props.char}
      className={cn(
        'relative w-10 h-14 text-[2rem]',
        'flex items-center justify-center',
        'transition-all duration-300',
        'border-border border-y border-r first:border-l first:rounded-l-md last:rounded-r-md',
        'group-hover:border-accent-foreground/20 group-focus-within:border-accent-foreground/20',
        'outline outline-0 outline-accent-foreground/20',
        { 'outline-4 outline-accent-foreground': props.isActive },
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
      {props.hasFakeCaret && <FakeCaret />}
    </div>
  )
}

// You can emulate a fake textbox caret!
function FakeCaret() {
  return (
    <div className="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink">
      <div className="w-px h-8 bg-white" />
    </div>
  )
}

// Inspired by Stripe's MFA input.
function FakeDash() {
  return (
    <div className="flex w-10 justify-center items-center">
      <div className="w-3 h-1 rounded-full bg-border" />
    </div>
  )
}
