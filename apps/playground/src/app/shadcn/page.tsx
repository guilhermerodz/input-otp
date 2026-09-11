'use client'

import * as React from 'react'

import { OTPInput, OTPInputContext } from 'input-otp'
import { cn } from '@/lib/utils'

// Isolated reproduction of shadcn/ui's official input-otp component and demo
// (https://ui.shadcn.com/docs/components/input-otp), the context in which the
// iOS selection artifact was originally reported (#75, #110). Structure and
// classNames match the registry source (new-york-v4); shadcn theme tokens are
// mapped to their zinc defaults since the playground has no shadcn theme, and
// the lucide MinusIcon is inlined.

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        'flex items-center gap-2',
        containerClassName,
      )}
      className={cn('disabled:cursor-not-allowed', className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn('flex items-center', className)}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center border-y border-r border-zinc-200 text-sm shadow-sm transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:border-zinc-400 data-[active=true]:ring-[3px] data-[active=true]:ring-zinc-400/50',
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="caret-blink h-4 w-px bg-zinc-950" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M5 12h14" />
      </svg>
    </div>
  )
}

export default function Page() {
  const [value, setValue] = React.useState('')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white text-zinc-950">
      <style>{`
        @keyframes caret-blink { 0%,70%,100% { opacity: 1 } 20%,50% { opacity: 0 } }
        .caret-blink { animation: caret-blink 1.25s ease-out infinite; }
      `}</style>

      <div className="space-y-2 text-center">
        <InputOTP
          maxLength={6}
          value={value}
          onChange={setValue}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <div className="text-sm text-zinc-500">
          {value === '' ? (
            <>Enter your one-time password.</>
          ) : (
            <>You entered: {value}</>
          )}
        </div>
      </div>
    </div>
  )
}
