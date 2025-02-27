import * as React from 'react'

import { OTPInput } from 'input-otp'
import { cn } from '@/lib/utils'

export function BaseOTPInput(
  overrideProps: Partial<React.ComponentProps<typeof OTPInput>> = {},
) {
  const [value, setValue] = React.useState('')
  const [disabled, setDisabled] = React.useState(false)


  function Slot(props: any) {
    return (
      <div
        className={cn(
          'relative w-10 h-14 text-[2rem]',
          'flex items-center justify-center',
          'transition-all duration-300',
          'border-border border-y border-r first:border-l first:rounded-l-md last:rounded-r-md',
          'group-hover:border-border/60 group-focus-within:border-border/60',
          'outline outline-0 outline-border/70',
          { 'outline-4 outline-border': props.isActive }
        )}
      >
        <div className="group-has-[input[data-input-otp-placeholder-shown]]:opacity-20">
          {props.char ?? props.placeholderChar}
        </div>
        {props.hasFakeCaret && <FakeCaret />}
      </div>
    );
  }
  
  // Component to emulate a blinking caret
  function FakeCaret() {
    return (
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink">
        <div className="w-px h-8 bg-foreground" />
      </div>
    );
  }
  
  // Component for the dash separator between groups of OTP slots
  function FakeDash() {
    return (
      <div className="flex w-10 justify-center items-center">
        <div className="w-3 h-1 rounded-full bg-border" />
      </div>
    );
  }

  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef}>
      <OTPInput
        // Normal props
        value={value}
        onChange={setValue}
        disabled={disabled}
        containerClassName={cn('group flex items-center', {
          'opacity-50': disabled,
        })}
        maxLength={6}
        autoFocus
        onComplete={() => console.log('complete')}
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
        {...overrideProps}
      />
    </div>
  )
}
