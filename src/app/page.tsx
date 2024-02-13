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
    <div className="w-[100dvw] h-[100dvh] bg-white text-black flex items-center justify-center [font-family:-apple-system,'system-ui','Segoe_UI',Roboto]">
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
    const previousCaretData = usePreviousValid(caretData, arr =>
      arr.every(n => n !== null),
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
      setCaretData([start, end])
    }

    function onInputFocus(e: React.SyntheticEvent<HTMLInputElement>) {
      handleFocus({ focusEvent: e })
    }

    function handleFocus(
      params: {
        focusEvent?: React.SyntheticEvent<HTMLInputElement>
        newCaretPositions?: number[]
      } = {},
    ) {
      if (!inputRef.current) {
        return
      }

      const isSyntheticEvent =
        (params.focusEvent?.nativeEvent as any).sourceCapabilities === null

      if (isSyntheticEvent) {
        return
      }

      const lastPos = value.length
      const positions = params.newCaretPositions ?? [lastPos, lastPos]

      setCaretPosition(positions[0], positions[1])
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

    function onContainerClick() {
      if (!inputRef.current) {
        return
      }

      // handleFocus()
    }

    function onSlotClick(e: React.MouseEvent<HTMLDivElement>, slotIdx: number) {
      if (!inputRef.current) {
        return
      }

      e.stopPropagation()

      const lastClickedSlot = previousCaretData[0]

      // Shift range selection
      if (e.shiftKey && lastClickedSlot !== null) {
        const p1: number = lastClickedSlot
        const p2: number = slotIdx

        // Get the greatest between p1 and p2, then increment 1
        const _start = Math.min(p1, p2)
        const _end = Math.max(p1, p2) + 1

        const start = Math.max(0, _start)
        const end = Math.min(_end, value.length)

        setCaretPosition(start, end)
        inputRef.current.focus()

        return
      }

      const newSlotIdx = slotIdx > value.length ? value.length : slotIdx

      setCaretPosition(newSlotIdx, newSlotIdx)
      inputRef.current.focus()
    }

    return (
      <div className="relative">
        <div
          className="flex items-center gap-0 text-[2rem] leading-none"
          onClick={onContainerClick}
        >
          {Array.from({ length: maxLength }).map((_, idx) => {
            return (
              <div
                key={idx}
                onClick={e => onSlotClick(e, idx)}
                className={cn(
                  'w-10 h-[52px] bg-white [--bsh-width:0px] transition-all border-slate-300 border-r border-y flex items-center justify-center',
                  {
                    '[box-shadow:0_0_0_var(--bsh-width)_rgb(147_197_253_/_.7)] border-blue-300 [--bsh-width:4px] z-10':
                      isCurrent(idx) || isSelected(idx),
                    '[&:nth-child(1)]:rounded-l-md [&:nth-child(1)]:border-l [&:nth-child(4)]:rounded-l-md [&:nth-child(4)]:border-l':
                      true,
                    '[&:last-child]:rounded-r-md [&:nth-child(3)]:rounded-r-md':
                      true,
                    'ml-10': idx === 3,
                  },
                )}
              >
                {paddedValue[idx]}
              </div>
            )
          })}
        </div>

        <input
          className={cn('pointer-events-none', 'absolute inset-0 opacity-0')}
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

export function usePreviousValid<T>(value: T, isValid: (value: T) => boolean) {
  const [current, setCurrent] = React.useState<T>(value)
  const [previous, setPrevious] = React.useState<T>(value)

  if (value !== current && isValid(value)) {
    setPrevious(current)
    setCurrent(value)
  }

  return previous
}
