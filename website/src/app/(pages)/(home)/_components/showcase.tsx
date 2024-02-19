'use client'

import React from 'react'

import { cn } from '@/lib/utils'
import { OTPInput, REGEXP_ONLY_DIGITS } from 'input-otp'

export function Showcase({ className, ...props }: { className?: string }) {
  const [value, setValue] = React.useState('12')
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current?.focus()
    }, 2000)

    return () => {
      clearTimeout(t)
    }
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
        ref={inputRef}
        value={value}
        onChange={setValue}
        containerClassName={cn(
          'group flex items-center has-[:disabled]:opacity-30',
        )}
        maxLength={6}
        allowNavigation={true}
        pattern={REGEXP_ONLY_DIGITS}
        render={({ slots, isFocused }) => (
          <>
            <div className="flex">
              {slots.slice(0, 3).map((slot, idx) => (
                <Slot
                  key={idx}
                  isFocused={isFocused}
                  animateIdx={idx}
                  {...slot}
                />
              ))}
            </div>

            {/* Layout inspired by Stripe */}
            <div className="flex w-10 md:20 justify-center items-center">
              <div className="w-3 md:w-6 h-1 md:h-2 rounded-full bg-border"></div>
            </div>

            <div className="flex">
              {slots.slice(3).map((slot, idx) => (
                <Slot isFocused={isFocused} key={idx} {...slot} />
              ))}
            </div>
          </>
        )}
      />
    </form>
  )
}

function Slot(props: {
  char: string | null
  isActive: boolean
  isFocused: boolean
  animateIdx?: number
}) {
  const willAnimateChar = props.animateIdx !== undefined && props.animateIdx < 2
  const willAnimateCaret = props.animateIdx === 2

  return (
    <div
      className={cn(
        'relative w-10 md:w-20 h-14 md:h-28 text-[2rem] md:text-[4rem] flex items-center justify-center border-border border-y border-r first:border-l first:rounded-l-md last:rounded-r-md transition-all [transition-duration:300ms] outline outline-0 outline-accent-foreground/20',
        'group-hover:border-accent-foreground/20 group-focus-within:border-accent-foreground/20',
        {
          'outline-4 outline-accent-foreground z-10': props.isActive,
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
        {props.char && <div>{props.char}</div>}
        {props.char === null && ' '}
      </div>

      {props.isActive && props.char === null && (
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
