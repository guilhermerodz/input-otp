'use client'

import * as React from 'react'
import Image from 'next/image'
import { cn } from './util/cn'

export default function Home() {
  const [otpInputValue, setOtpInputValue] = React.useState<string>('123123')

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
        regexp={/^\d+$/}
      />
    </div>
  )
}

interface OTPInputProps {
  value: string
  onChange: (value: string) => void

  regexp?: RegExp
  onComplete?: (...args: any[]) => unknown

  maxLength: number
}
const OTPInput = React.forwardRef<HTMLInputElement, OTPInputProps>(
  ({ maxLength, value, onChange, regexp, onComplete, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(ref, () => inputRef.current! as any)

    const paddedValue = value.padEnd(maxLength, ' ')

    // Workaround to track the input's  selection even if Meta key is pressed
    // This was necessary due to the input `onSelect` only being called either 1. before Meta key is pressed or 2. after Meta key is released
    const [isMetaPressed, setIsMetaPressed] = React.useState<boolean>(false)
    React.useEffect(() => {
      if (!isMetaPressed) {
        return
      }

      const interval = setInterval(() => {
        if (!inputRef.current) {
          return
        }

        onInputSelect({
          overrideStart: inputRef.current.selectionStart,
          overrideEnd: inputRef.current.selectionEnd,
        })
      }, 2)

      return () => {
        clearInterval(interval)
      }
    }, [isMetaPressed, onInputSelect])

    const [caretData, setCaretData] = React.useState<
      [number | null, number | null]
    >([null, null])
    const clamppedCaretData = caretData.map(n =>
      n === null ? n : Math.max(0, Math.min(n, maxLength)),
    )
    const previousCaretData = usePreviousValid(caretData, arr =>
      arr.every(n => n !== null),
    )

    function onInputSelect(params: {
      // TODO: only use `start` and `end` as params
      e?: React.SyntheticEvent<HTMLInputElement>
      overrideStart?: number | null
      overrideEnd?: number | null
    }) {
      if (
        !params.e &&
        params.overrideStart === undefined &&
        params.overrideEnd === undefined
      ) {
        return
      }

      const start =
        params.overrideStart === undefined
          ? params.e!.currentTarget.selectionStart
          : params.overrideStart
      const end =
        params.overrideEnd === undefined
          ? params.e!.currentTarget.selectionEnd
          : params.overrideEnd

      // Check if there is no selection range
      if (start === end && start !== null) {
        const n = start === maxLength ? maxLength - 1 : start

        const _start = Math.min(n, maxLength - 1)
        const _end = n + 1

        setCaretPosition(_start, _end)
        return
      }

      setCaretData([start, end])
    }

    function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === 'Meta') {
        setIsMetaPressed(true)
      }

      if (!inputRef.current) {
        return
      }

      if (caretData[0] === null) {
        return
      }

      if (e.key === 'Backspace' && (e.metaKey || e.altKey)) {
        // Check if there is a range selection
        if (
          inputRef.current.selectionStart !== null &&
          inputRef.current.selectionEnd !== null &&
          inputRef.current.selectionStart !== inputRef.current.selectionEnd
        ) {
          e.preventDefault()

          const valueAfterDeletion = value.slice(
            inputRef.current.selectionEnd,
            value.length,
          )

          const oldCaretStart = inputRef.current.selectionStart

          onChange(valueAfterDeletion)
          // const deletedLength = value.length - valueAfterDeletion.length

          // setCaretPosition(
          //   oldCaretStart - deletedLength + 1,
          //   oldCaretStart - deletedLength + 2,
          // )
        }
      }

      if (
        e.key === 'ArrowLeft' &&
        !e.shiftKey &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault()

        if (caretData[0] !== null && caretData[1] !== null) {
          const start = Math.max(0, caretData[0] - 1)
          const end = start + 1

          setCaretPosition(start, end)
        }
      }
      if (
        e.key === 'ArrowRight' &&
        !e.shiftKey &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault()

        if (caretData[0] !== null && caretData[1] !== null) {
          const start = Math.min(caretData[1], maxLength - 1)
          const end = Math.min(maxLength, caretData[1] + 1)

          setCaretPosition(start, end)
        }
      }
    }

    function setCaretPosition(start: number, end: number) {
      if (!inputRef.current) {
        return
      }

      inputRef.current.setSelectionRange(start, end)
      setCaretData([start, end])
    }

    function onInputFocus(e: React.SyntheticEvent<HTMLInputElement>) {
      setCaretData([
        e.currentTarget.selectionStart,
        e.currentTarget.selectionEnd,
      ])
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

    function onContainerClick(e: React.MouseEvent<HTMLDivElement>) {
      if (!inputRef.current) {
        return
      }

      e.preventDefault()

      const insertPos = value.length + 1
      const clamppedInsertPos = Math.max(insertPos, maxLength - 1)
      setCaretPosition(clamppedInsertPos - 1, clamppedInsertPos)
      inputRef.current.focus()
    }

    function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
      const prevValue = e.currentTarget.value
      const newValue = e.target.value

      e.preventDefault()

      const valueWithoutSpaces = newValue.replaceAll(' ', '').trim()
      if (
        regexp !== undefined &&
        valueWithoutSpaces.length > 0 &&
        !regexp.test(valueWithoutSpaces)
      ) {
        return
      }

      onChange(newValue)
      if (newValue.length === maxLength && onComplete) {
        onComplete()
      }

      if (
        prevValue.length === maxLength &&
        prevValue.length === newValue.length
      ) {
        const lastPos = newValue.length
        setCaretPosition(lastPos - 1, lastPos)
      }
    }

    function onSlotClick(e: React.MouseEvent<HTMLDivElement>, slotIdx: number) {
      if (!inputRef.current) {
        return
      }

      e.preventDefault()
      e.stopPropagation()

      // const lastClickedSlot = previousCaretData[0]

      // // Shift range selection
      // if (e.shiftKey && lastClickedSlot !== null) {
      //   const p1: number = lastClickedSlot
      //   const p2: number = slotIdx

      //   // Get the greatest between p1 and p2, then increment 1
      //   const _start = Math.min(p1, p2)
      //   const _end = Math.max(p1, p2) + 1

      //   const start = Math.max(0, _start)
      //   const end = Math.min(_end, value.length)

      //   setCaretPosition(start, end)
      //   inputRef.current.focus()

      //   return
      // }

      // Shift range selection
      if (e.shiftKey && previousCaretData[0] !== null && previousCaretData[1] !== null) {
        console.log({caretData})
        
        // const dir = slotIdx < previousCaretData[0] ? 0 : 1

        // const start = dir === 0 ? slotIdx : previousCaretData[0]
        // const end = dir === 1 ? slotIdx + 1 : previousCaretData[1]

        // console.log({start,end,dir,previousCaretData})
        
        // setCaretPosition(start, end)
        // inputRef.current.focus()

        return
      }

      const newSlotIdx = slotIdx > value.length ? value.length : slotIdx

      setCaretPosition(newSlotIdx, newSlotIdx + 1)
      inputRef.current.focus()
    }

    function onInputKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === 'Meta') {
        setIsMetaPressed(false)
      }

      if (!inputRef.current) {
        return
      }

      const start = inputRef.current.selectionStart
      const end = inputRef.current.selectionEnd

      if (e.key === 'Meta' || e.key === 'Alt' || e.key === 'Control') {
        if (start !== null && end !== null) {
          if (start === end) {
            if (value.length === 0) {
              // Do nothing
            } else if (start === 0) {
              setCaretPosition(0, 1)
            } else if (start === maxLength) {
              setCaretPosition(maxLength - 1, maxLength)
            } else if (start === value.length) {
              setCaretPosition(value.length, value.length)
            }
          }
        }
      }
    }

    return (
      <div className="relative">
        <div
          className="flex items-center gap-0 text-[2rem] leading-none"
          onClick={onContainerClick}
          tabIndex={-1}
        >
          {Array.from({ length: maxLength }).map((_, idx) => {
            return (
              <div
                key={idx}
                onClick={e => onSlotClick(e, idx)}
                aria-hidden
                className={cn(
                  'relative w-10 h-[52px] bg-white [--bsh-width:0px] transition-all border-slate-300 border-r border-y flex items-center justify-center',
                  '[&:nth-child(1)]:rounded-l-md [&:nth-child(1)]:border-l [&:nth-child(4)]:rounded-l-md [&:nth-child(4)]:border-l',
                  '[&:last-child]:rounded-r-md [&:nth-child(3)]:rounded-r-md',
                  '[&:nth-child(4)]:ml-10',
                  {
                    '[box-shadow:0_0_0_var(--bsh-width)_rgb(147_197_253_/_.7)] border-blue-300 [--bsh-width:4px] z-10':
                      isCurrent(idx) || isSelected(idx),
                  },
                )}
              >
                {paddedValue[idx]}

                {/* Blinking Caret */}
                {isCurrent(idx) && paddedValue[idx] === ' ' && (
                  <FakeCaretRoot>
                    <div className="absolute pointer-events-none inset-0 flex items-center justify-center">
                      <div className="w-px h-[32px] bg-black" />
                    </div>
                  </FakeCaretRoot>
                )}
              </div>
            )
          })}
        </div>

        <input
          className={cn('pointer-events-none', 'absolute inset-0 opacity-0')}
          className={cn('pointer-events-none')}
          ref={inputRef}
          maxLength={maxLength}
          value={value}
          onFocus={onInputFocus}
          onChange={onInputChange}
          onSelect={e => onInputSelect({ e })}
          onKeyDown={onInputKeyDown}
          onKeyUp={onInputKeyUp}
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

interface FakeCaretProps {
  blinking?: boolean
  blinkingMsOn?: number
  blinkingMsOff?: number

  children: React.ReactNode
}
function FakeCaretRoot({
  blinking = true,
  blinkingMsOn = 600,
  blinkingMsOff = 600,
  children,
  ...props
}: FakeCaretProps) {
  const [on, setOn] = React.useState<boolean>(true)

  React.useEffect(() => {
    const interval = setInterval(
      () => {
        setOn(prev => !prev)
      },
      on ? blinkingMsOn : blinkingMsOff,
    )

    return () => {
      clearInterval(interval)
    }
  }, [blinkingMsOff, blinkingMsOn, on])
  // TODO: count `lastUpdated` to reset the timer

  return (
    <div
      style={{
        opacity: on ? 1 : 0,
      }}
    >
      {children}
    </div>
  )
}
