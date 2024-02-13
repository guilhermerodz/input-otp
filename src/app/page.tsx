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
    const clamppedCaretData = caretData.map(n =>
      n === null ? n : Math.max(0, Math.min(n, maxLength)),
    )

    function onInputSelect(e: React.SyntheticEvent<HTMLInputElement>) {
      const { selectionStart, selectionEnd } = e.currentTarget

      setCaretData([selectionStart, selectionEnd])
    }

    function setCaretPosition(start: number, end: number) {
      if (!inputRef.current) {
        return
      }

      inputRef.current.setSelectionRange(start, end)
    }

    function onInputFocus(e: React.SyntheticEvent<HTMLInputElement>) {
      const lastPos = value.length
      setCaretPosition(lastPos, lastPos)
    }

    function isSelected(slotIdx: number) {
      return (
        caretData[0] !== null &&
        caretData[1] !== null &&
        slotIdx >= caretData[0] &&
        slotIdx < caretData[1]
      )
    }

    function isCurrent(slotIdx: number) {
      // TODO: simplify logic
      return (
        (clamppedCaretData[0] === slotIdx &&
          clamppedCaretData[1] === slotIdx) ||
        (slotIdx === maxLength - 1 &&
          clamppedCaretData[0] === maxLength &&
          clamppedCaretData[1] === maxLength)
      )
    }

    return (
      <div className="relative">
        <div className="flex items-center gap-2">
          {Array.from({ length: maxLength }).map((_, idx) => {
            return (
              <div
                key={idx}
                className={cn('w-10 h-10 bg-white rounded-md', {
                  'bg-[green]': isSelected(idx),
                  'bg-[yellow]': isCurrent(idx),
                })}
              >
                {paddedValue[idx]}
              </div>
            )
          })}
        </div>

        <input
          className={cn(
            'pointer-events-none',
            // "absolute inset-0 opacity-0"
          )}
          ref={inputRef}
          maxLength={maxLength}
          value={value}
          onFocus={onInputFocus}
          onChange={e => onChange(e.target.value)}
          onSelect={onInputSelect}
          onBlur={() => setCaretData([null, null])}
        />
      </div>
    )
  },
)
OTPInput.displayName = 'OTPInput'
