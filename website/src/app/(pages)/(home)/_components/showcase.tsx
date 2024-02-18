'use client'

import React from 'react'

import { OTPInput } from 'otp-input'
import { cn } from '@/lib/utils'

export function Showcase({ className, ...props }: { className?: string }) {
  const [value, setValue] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus()
    }, 2000)
  }, [])

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (value === '123456') {
      // Easter egg...
      return
    }

    const firstDemoInput =
      document.querySelector<HTMLInputElement>('#first-demo-input')
    firstDemoInput!.focus()
  }

  return (
    <form
      className={cn(
        'mx-auto flex max-w-[980px] justify-center pt-6 pb-4',
        className,
      )}
      onSubmit={onSubmit}
    >
      <OTPInput
        value={value}
        onChange={setValue}
        containerClassName={cn('group flex items-center')}
        maxLength={6}
        // regexp={null} // Allow everything
        render={({ slots, isFocused }) => (
          <>
            <div className="flex">
              {slots.slice(0, 3).map((slot, idx) => (
                <Slot
                  isFocused={isFocused}
                  key={idx}
                  slotChar={slot.char}
                  isSlotActive={slot.isActive}
                  animateIdx={idx}
                />
              ))}
            </div>

            {/* Layout inspired by Stripe */}
            <div className="flex w-10 justify-center items-center">
              <div className="w-3 h-1 rounded-full bg-border"></div>
            </div>

            <div className="flex">
              {slots.slice(3).map((slot, idx) => (
                <Slot
                  isFocused={isFocused}
                  key={idx}
                  slotChar={slot.char}
                  isSlotActive={slot.isActive}
                />
              ))}
            </div>
          </>
        )}
      />
    </form>
  )
}

function Slot(props: {
  slotChar: string | null
  isSlotActive: boolean
  isFocused: boolean
  animateIdx?: number
}) {
  const willAnimateChar = props.animateIdx !== undefined && props.animateIdx < 2
  const willAnimateCaret = props.animateIdx === 2

  return (
    <div
      className={cn(
        'relative w-10 md:w-20 h-14 md:h-28 text-[2rem] lg:text-[4rem] flex items-center justify-center border-border border-y border-r first:border-l first:rounded-l-md last:rounded-r-md transition-all [transition-duration:300ms] [--bsh-width:0] [box-shadow:0_0_0_var(--bsh-width)_hsl(var(--accent-foreground)_/_1)] ',
        'group-hover:border-accent-foreground/20 group-focus-within:border-accent-foreground/20',
        {
          // 'group-focus-within:border-accent-foreground/20': props.isFocused,
          '[--bsh-width:4px] z-10': props.isSlotActive,
        },
      )}
    >
      <div
        className={cn('duration-1000', {
          'opacity-0 animate-fade-in': willAnimateChar,
          '[animation-delay:1.5s]': props.animateIdx === 0,
          '[animation-delay:2s]': props.animateIdx === 1,
        })}
      >
        {props.slotChar && <div>{props.slotChar}</div>}
        {props.slotChar === null && ' '}
      </div>

      {props.isSlotActive && props.slotChar === null && (
        <div
          className={cn({
            'opacity-0 animate-fade-in': willAnimateCaret,
          })}
        >
          <FakeCaret />
        </div>
      )}
    </div>
  )
}

function FakeCaret() {
  return (
    <div className="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink [animate-delay:inherit]">
      <div className="w-px h-8 md:w-0.5 md:h-16 bg-white" />
    </div>
  )
}
