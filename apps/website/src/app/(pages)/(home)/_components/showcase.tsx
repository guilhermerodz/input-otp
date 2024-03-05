'use client'

import React, { useMemo } from 'react'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'

import { OTPInput, REGEXP_ONLY_DIGITS } from 'input-otp'
import { cn } from '@/lib/utils'

const DynamicConfetti = dynamic(() =>
  import('./confetti').then(m => m.Confetti),
)

export function Showcase({ className, ...props }: { className?: string }) {
  const [value, setValue] = React.useState('12')
  const [disabled, setDisabled] = React.useState(false)

  const [preloadConfetti, setPreloadConfetti] = React.useState(0)
  const [hasGuessed, setHasGuessed] = React.useState(false)

  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 1023px)').matches
    if (!isMobile)  {
      setDisabled(true)
    }
    const t1 = setTimeout(() => {
      setDisabled(false)
    }, 1_900)
    const t2 = setTimeout(
      () => {
        inputRef.current?.focus()
      },
      isMobile ? 0 : 2_500,
    )

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  React.useEffect(() => {
    if (value.length > 3) {
      setPreloadConfetti(p => p + 1)
    }
  }, [value.length])

  async function onSubmit(e?: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault?.()

    inputRef.current?.select()
    await new Promise(r => setTimeout(r, 1_00))

    if (value === '123456') {
      setHasGuessed(true)

      setTimeout(() => {
        setHasGuessed(false)
      }, 1_000)
    } else {
      toast('Try guessing the right password 🤔', { position: 'top-right' })
    }

    const anchor = document.querySelector<HTMLInputElement>(
      '.code-example-anchor',
    )

    window.scrollTo({
      top: anchor?.getBoundingClientRect().top,
      behavior: 'smooth',
    })

    setValue('')
    setTimeout(() => {
      inputRef.current?.blur()
    }, 20)
  }

  return (
    <>
      {preloadConfetti === 1 && (
        <div className="hidden">
          <DynamicConfetti />
        </div>
      )}
      {hasGuessed && (
        <div className="fixed inset-0 z-50 pointer-events-none motion-reduce:hidden">
          <DynamicConfetti />
        </div>
      )}

      <form
        className={cn(
          'mx-auto flex max-w-[980px] justify-center pt-6 pb-4',
          className,
        )}
        onSubmit={onSubmit}
      >
        <OTPInput
          onComplete={onSubmit}
          disabled={disabled}
          ref={inputRef}
          value={value}
          onChange={setValue}
          containerClassName={cn('group flex items-center')}
          maxLength={6}
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
    </>
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
          'outline-4 outline-accent-foreground': props.isActive,
        },
      )}
    >
      <div
        className={cn('duration-1000', {
          'lg:opacity-0 lg:animate-fade-in': willAnimateChar,
          'lg:[animation-delay:1.5s]': props.animateIdx === 0,
          'lg:[animation-delay:2s]': props.animateIdx === 1,
        })}
      >
        {props.char && <div>{props.char}</div>}
        {props.char === null && ' '}
      </div>

      {props.isActive && props.char === null && (
        <div
          className={cn({
            'lg:opacity-0 lg:animate-fade-in': willAnimateCaret,
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
