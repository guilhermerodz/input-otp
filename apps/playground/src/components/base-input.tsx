import * as React from 'react'

import { OTPInput } from 'input-otp'
import { cn } from '@/lib/utils'

export function BaseOTPInput(
  overrideProps: Partial<React.ComponentProps<typeof OTPInput>> = {},
) {
  const [value, setValue] = React.useState('')
  const [disabled, setDisabled] = React.useState(false)

  return (
    <OTPInput
      // Normal props
      value={value}
      onChange={setValue}
      disabled={disabled}
      containerClassName={cn('group flex items-center', {
        'opacity-50': disabled,
      })}
      maxLength={6}
      render={({ slots, isFocused, isHovering }) => (
        <div
          className={cn('flex items-center gap-1', {
            'opacity-50': overrideProps.disabled ?? disabled,
          })}
          data-testid="input-otp-renderer"
          data-test-render-is-hovering={isHovering ? 'true' : undefined}
          data-test-render-is-focused={isFocused ? 'true' : undefined}
        >
          {slots.map((slot, idx) => (
            <div
              data-testid={`slot-${idx}`}
              data-test-char={slot.char ?? undefined}
              key={idx}
              className={cn(
                'transition-all duration-300 rounded-md border-black bg-white text-black w-10 h-14 border-[4px]',
                {
                  'border-[green]': isFocused,
                  'border-[red]': slot.isActive,
                },
              )}
            >
              {slot.char !== null ? slot.char : ' '}
            </div>
          ))}
        </div>
      )}
      {...overrideProps}
    />
  )
}
