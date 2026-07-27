'use client'

import * as React from 'react'
import { OTPInput } from 'input-otp'

import { Slot } from '@/components/ui/otp-slot'

const ALIGNMENTS = ['left', 'center', 'right'] as const

/**
 * `textAlign` positions the *invisible* text inside the input. It has no effect
 * on your slots — it decides where the native caret lands after a tap and where
 * iOS anchors its long-press selection bubble.
 */
export function TextAlignDemo() {
  const [textAlign, setTextAlign] =
    React.useState<(typeof ALIGNMENTS)[number]>('left')
  const [value, setValue] = React.useState('1234')

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-muted/30 p-0.5">
        {ALIGNMENTS.map(option => (
          <button
            key={option}
            type="button"
            onClick={() => setTextAlign(option)}
            aria-pressed={textAlign === option}
            className={
              textAlign === option
                ? 'rounded bg-foreground/[0.09] px-2.5 py-1 font-mono text-xs text-foreground'
                : 'rounded px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground'
            }
          >
            {option}
          </button>
        ))}
      </div>

      {/* Remounting on change keeps the demo honest: the prop is read when the
          input's style object is built. */}
      <OTPInput
        key={textAlign}
        textAlign={textAlign}
        maxLength={6}
        value={value}
        onChange={setValue}
        containerClassName="group flex items-center"
        render={({ slots }) => (
          <div className="flex">
            {slots.map((slot, idx) => (
              <Slot key={idx} {...slot} />
            ))}
          </div>
        )}
      />
    </div>
  )
}
