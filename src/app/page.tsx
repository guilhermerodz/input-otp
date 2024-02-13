'use client'

import * as React from 'react'
import Image from 'next/image'
import { cn } from './util/cn'

export default function Home() {
  const [otpInputValue, setOtpInputValue] = React.useState<string>('')

  function getInputRef(el: HTMLInputElement) {
    // console.log({el})
  }

  return (
    <div className="w-[100dvw] h-[100dvh] bg-black text-black flex items-center justify-center">
      <OTPInput
        value={otpInputValue}
        onChange={setOtpInputValue}
        maxLength={6}
        ref={getInputRef}
      />
    </div>
  )
}

interface OTPInputProps {
  value: string
  onChange: (value: string) => void

  maxLength: number
}
const OTPInput = React.forwardRef<HTMLInputElement, OTPInputProps>(
  ({ maxLength, value, onChange, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(ref, () => inputRef.current! as any)

    const paddedValue = value.padEnd(maxLength, ' ')

    const [caretData, setCaretData] = React.useState<
      [number | null, number | null]
    >([null, null])

    function onInputSelect(e: React.SyntheticEvent<HTMLInputElement>) {
      const { selectionStart, selectionEnd } = e.currentTarget

      setCaretData([selectionStart, selectionEnd])
    }

    function isSelected(slotIdx: number) {
      return (
        caretData[0] !== null &&
        caretData[1] !== null &&
        slotIdx >= caretData[0] &&
        slotIdx < caretData[1]
      )
    }

    return (
      <div>
        <div className="flex items-center gap-2">
          {Array.from({ length: maxLength }).map((_, idx) => {
            return (
              <div
                key={idx}
                className={cn('w-10 h-10 bg-white rounded-md', {
                  'bg-[green]': isSelected(idx),
                })}
              >
                {paddedValue[idx]}
              </div>
            )
          })}
        </div>

        <input
          ref={inputRef}
          maxLength={maxLength}
          value={value}
          onChange={e => onChange(e.target.value)}
          onSelect={onInputSelect}
          onBlur={() => setCaretData([null, null])}
        />
      </div>
    )
  },
)
OTPInput.displayName = 'OTPInput'
