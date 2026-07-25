'use client'

import * as React from 'react'
import { OTPInput, OTPInputContext } from 'input-otp'

import { Slot } from '@/components/ui/otp-slot'

/**
 * The same field, composed instead of rendered from a callback. Drop the
 * `render` prop and pass children: every descendant can read slot state from
 * `OTPInputContext`. This is what shadcn/ui's `<InputOTPSlot index={n} />`
 * is built on.
 */
export function ContextApiDemo() {
  return (
    <OTPInput maxLength={6} containerClassName="group flex items-center">
      <SlotAt index={0} />
      <SlotAt index={1} />
      <SlotAt index={2} />
      <Separator />
      <SlotAt index={3} />
      <SlotAt index={4} />
      <SlotAt index={5} />
    </OTPInput>
  )
}

function SlotAt({ index }: { index: number }) {
  const { slots } = React.useContext(OTPInputContext)
  return <Slot {...slots[index]} />
}

function Separator() {
  return (
    <div role="separator" aria-orientation="vertical" className="px-3">
      <div className="h-1 w-3 rounded-full bg-border" />
    </div>
  )
}
