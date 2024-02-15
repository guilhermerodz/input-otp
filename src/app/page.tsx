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
      />
    </div>
  )
}

interface OTPInputProps {
  value: string
  onChange: (value: string) => void

  regexp?: RegExp | null
  onComplete?: (...args: any[]) => unknown

  maxLength: number
}
const OTPInput = React.forwardRef<HTMLInputElement, OTPInputProps>(
  (
    { maxLength, value, onChange, regexp = /^\d+$/, onComplete, ...props },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(ref, () => inputRef.current! as any)

    const [isFocused, setIsFocused] = React.useState<boolean>(false)

    const paddedValue = value.padEnd(maxLength, ' ')

    const [caretData, setCaretData] = React.useState<
      [number | null, number | null]
    >([null, null])
    // const previousCaretData = usePreviousValid(caretData, arr =>
    //   arr.every(n => n !== null),
    // )

    const onInputSelect = React.useCallback(
      (params: {
        e?: React.SyntheticEvent<HTMLInputElement>
        overrideStart?: number | null
        overrideEnd?: number | null
      }) => {
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
      },
      [maxLength],
    )

    // Workaround to track the input's  selection even if Meta key is pressed
    // This was necessary due to the input `onSelect` only being called either 1. before Meta key is pressed or 2. after Meta key is released
    // TODO: track `Meta` and `Tab`
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

    // TODO: rename to `mutateInputSelectionAndSyncCaretData`
    function setCaretPosition(start: number | null, end: number | null) {
      if (!inputRef.current) {
        return
      }

      const isFocused = inputRef.current === document.activeElement

      if (!isFocused) {
        throw new Error("Called `setCaretPosition` while input isn't focused")
      }

      inputRef.current.setSelectionRange(start, end)
      setCaretData([start, end])
    }

    function onInputFocus(e: React.SyntheticEvent<HTMLInputElement>) {
      if (!inputRef.current) {
        return
      }

      setIsFocused(true)

      // Default to the last slot or insert position
      const end = Math.min(maxLength, value.length + 1)
      const start = Math.max(0, end - 1)

      setCaretPosition(start, end)
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
      if (caretData[0] === null || caretData[1] === null) {
        return false
      }

      return slotIdx >= caretData[0] && slotIdx < caretData[1]
    }

    function onContainerClick(e: React.MouseEvent<HTMLDivElement>) {
      if (!inputRef.current) {
        return
      }

      e.preventDefault()

      inputRef.current.focus()
    }

    function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
      const prevValue = e.currentTarget.value
      const newValue = e.target.value

      e.preventDefault()

      const valueWithoutSpaces = newValue.replaceAll(' ', '').trim()
      if (
        regexp !== null &&
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

    function onInputBlur() {
      setIsFocused(false)
      setCaretData([null, null])
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
                onClick={onContainerClick}
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
                <div
                  className={cn('transition-all duration-500', {
                    'opacity-0': paddedValue[idx] === ' ',
                    'opacity-100': paddedValue[idx] !== ' ',
                  })}
                >
                  {paddedValue[idx]}
                </div>

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
          // className={cn('pointer-events-none')}
          ref={inputRef}
          maxLength={maxLength}
          value={value}
          onFocus={onInputFocus}
          onChange={onInputChange}
          onSelect={e => onInputSelect({ e })}
          onKeyDown={onInputKeyDown}
          onKeyUp={onInputKeyUp}
          onBlur={onInputBlur}
        />

        {/* {JSON.stringify({ caretData })} */}
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
