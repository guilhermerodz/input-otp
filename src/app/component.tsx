import * as React from 'react'

interface OTPInputProps {
  name?: string
  onBlur?: (...args: any[]) => unknown
  disabled?: boolean

  value: string
  onChange: (value: string) => unknown

  maxLength: number
  regexp?: RegExp | null
  allowSpaces?: boolean

  onComplete?: (...args: any[]) => unknown

  render: (props: {
    triggerProps: {
      onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => unknown
      tabIndex: number
      type: 'button'
      disabled?: boolean
    }
    slots: { isActive: boolean; char: string | null }[]
    isFocused: boolean
    paddedValue: string
  }) => React.ReactElement
}
export const OTPInput = React.forwardRef<HTMLDivElement, OTPInputProps>(
  (
    {
      name,
      onBlur,
      disabled,

      value,
      onChange,

      maxLength,
      regexp = /^\d+$/,
      allowSpaces = true,

      onComplete,

      render,

      ...props
    },
    ref,
  ) => {
    /** Logic */
    const inputRef = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(ref, () => inputRef.current! as any)

    const [isFocused, setIsFocused] = React.useState<boolean>(false)

    const paddedValue = value.padEnd(maxLength, ' ')

    const [caretData, setCaretData] = React.useState<
      [number | null, number | null]
    >([null, null])

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

          onChange(valueAfterDeletion)
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
        return
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

      onBlur?.()
    }

    const isSelected = React.useCallback(
      (slotIdx: number) => {
        return (
          caretData[0] !== null &&
          caretData[1] !== null &&
          slotIdx >= caretData[0] &&
          slotIdx < caretData[1]
        )
      },
      [caretData],
    )

    const isCurrent = React.useCallback(
      (slotIdx: number) => {
        if (caretData[0] === null || caretData[1] === null) {
          return false
        }

        return slotIdx >= caretData[0] && slotIdx < caretData[1]
      },
      [caretData],
    )

    /** JSX */
    const renderedChildren = React.useMemo<ReturnType<typeof render>>(() => {
      return render({
        triggerProps: {
          onClick: e => {
            e.preventDefault()
            inputRef.current?.focus()
          },
          tabIndex: -1,
          type: 'button',
          disabled,
        },
        slots: Array.from({ length: maxLength }).map((_, slotIdx) => ({
          char: value[slotIdx] !== undefined ? value[slotIdx] : null,
          isActive: isCurrent(slotIdx) || isSelected(slotIdx),
        })),
        isFocused,
        paddedValue,
      })
    }, [
      disabled,
      isCurrent,
      isFocused,
      isSelected,
      maxLength,
      paddedValue,
      render,
      value,
    ])

    // TODO: allow for custom container
    return (
      <div ref={ref} style={{ position: 'relative' }} {...props}>
        {renderedChildren}

        <input
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            pointerEvents: 'none',
            outline: 'none !important',
          }}
          name={name}
          disabled={disabled}
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
      </div>
    )
  },
)
OTPInput.displayName = 'OTPInput'

// interface FakeCaretProps {
//   blinking?: boolean
//   blinkingMsOn?: number
//   blinkingMsOff?: number

//   children: React.ReactNode
// }
// export function FakeCaretRoot({
//   blinking = true,
//   blinkingMsOn = 600,
//   blinkingMsOff = 600,
//   children,
//   ...props
// }: FakeCaretProps) {
//   const [on, setOn] = React.useState<boolean>(true)

//   React.useEffect(() => {
//     const interval = setInterval(
//       () => {
//         setOn(prev => !prev)
//       },
//       on ? blinkingMsOn : blinkingMsOff,
//     )

//     return () => {
//       clearInterval(interval)
//     }
//   }, [blinkingMsOff, blinkingMsOn, on])
//   // TODO: count `lastUpdated` to reset the timer

//   return (
//     <div
//       style={{
//         opacity: on ? 1 : 0,
//       }}
//     >
//       {children}
//     </div>
//   )
// }
