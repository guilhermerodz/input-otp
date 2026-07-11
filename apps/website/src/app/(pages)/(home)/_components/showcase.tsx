'use client'

import React from 'react'
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
    if (!isMobile) {
      setDisabled(true)
    }
    const t1 = setTimeout(() => {
      setDisabled(false)
    }, 1_300)
    const t2 = setTimeout(
      () => {
        inputRef.current?.focus()
      },
      isMobile ? 0 : 1_600,
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
      }, 1_200)
    } else {
      toast('Try guessing the right password 🤔', { position: 'top-right' })
    }

    document
      .querySelector<HTMLElement>('#after-hero-anchor')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })

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
          <DynamicConfetti
            pageCoords={{
              x:
                inputRef.current!.getBoundingClientRect().left +
                (inputRef.current?.getBoundingClientRect().width || 0) * 0.9,
              y:
                inputRef.current!.getBoundingClientRect().top +
                (inputRef.current?.getBoundingClientRect().height || 0) / 2,
            }}
          />
        </div>
      )}

      <form
        className={cn(
          'mx-auto flex max-w-[980px] justify-center pt-8 pb-4',
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
          aria-label="showcase-otp-input"
          render={({ slots, isFocused }) => (
            <>
              <div className="flex gap-1.5 md:gap-2">
                {slots.slice(0, 3).map((slot, idx) => (
                  <Slot
                    key={idx}
                    isFocused={isFocused}
                    isSuccess={hasGuessed}
                    animateIdx={idx}
                    {...slot}
                  />
                ))}
              </div>

              {/* Layout inspired by Stripe */}
              <div className="flex w-8 md:w-16 justify-center items-center">
                <div className="w-3 md:w-6 h-1 md:h-1.5 rounded-full bg-border"></div>
              </div>

              <div className="flex gap-1.5 md:gap-2">
                {slots.slice(3).map((slot, idx) => (
                  <Slot
                    isFocused={isFocused}
                    isSuccess={hasGuessed}
                    key={idx}
                    {...slot}
                  />
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
  isSuccess: boolean
  animateIdx?: number
}) {
  const willAnimateChar = props.animateIdx !== undefined && props.animateIdx < 2
  const willAnimateCaret = props.animateIdx === 2

  return (
    <div
      className={cn(
        'keycap relative w-10 md:w-[4.5rem] h-14 md:h-24 text-[2rem] md:text-[3.25rem] font-medium tabular-nums rounded-lg md:rounded-xl',
        'flex items-center justify-center',
        'transition-[box-shadow,border-color,transform] duration-300 ease-out',
        'group-hover:border-foreground/25',
        {
          '!border-foreground/80 md:-translate-y-0.5 shadow-[0_0_0_1px_hsl(var(--foreground)/0.8),0_8px_24px_-8px_hsl(var(--foreground)/0.35)]':
            props.isActive && !props.isSuccess,
          '!border-emerald-500 shadow-[0_0_0_1px_rgb(16_185_129),0_8px_28px_-6px_rgb(16_185_129/0.5)]':
            props.isSuccess,
        },
      )}
    >
      <div
        className={cn('duration-500', {
          'lg:opacity-0 lg:animate-fade-in': willAnimateChar,
          'lg:[animation-delay:800ms]': props.animateIdx === 0,
          'lg:[animation-delay:1100ms]': props.animateIdx === 1,
        })}
      >
        {props.char && <div>{props.char}</div>}
        {props.char === null && ' '}
      </div>

      {props.isActive && props.char === null && (
        <div
          className={cn({
            'lg:opacity-0 lg:animate-fade-in lg:[animation-delay:1400ms]':
              willAnimateCaret,
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
      <div className="w-px h-8 md:w-0.5 md:h-12 bg-foreground" />
    </div>
  )
}
