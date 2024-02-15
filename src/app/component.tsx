import * as React from 'react'

const SPECIAL_KEYS = ['Meta', 'Alt', 'Control', 'Tab', 'Z']

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

  behavior?: 'insert-and-navigate' | 'insert-only'

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
      allowSpaces = false,

      onComplete,

      render,

      ...props
    },
    ref,
  ) => {
    // console.count('rerender')

    /** Logic */
    const inputRef = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(
      ref,
      () => {
        const el = inputRef.current as HTMLInputElement

        // const _setSelectionRange = el.setSelectionRange.bind(el)
        // el.setSelectionRange = (
        //   ...args: Parameters<typeof _setSelectionRange>
        // ) => {
        //   // console.count('calling setSelectionRange')
        //   _setSelectionRange(...args)
        // }

        const _select = el.select.bind(el)
        el.select = () => {
          _select()
          // Proxy to update the caretData
          setCaretData([0, el.value.length])
        }
        return el
      },
      [],
    )

    const [isFocused, setIsFocused] = React.useState<boolean>(false)

    const paddedValue = value.padEnd(maxLength, ' ')

    const [caretData, setCaretData] = React.useState<
      [number | null, number | null]
    >([null, null])

    // TODO: rename to `mutateInputSelectionAndSyncCaretData`
    const setCaretPosition = React.useCallback(
      (start: number | null, end: number | null) => {
        if (!inputRef.current) {
          return
        }

        const isFocused = inputRef.current === document.activeElement

        if (!isFocused) {
          return
        }

        if (caretData[0] === start && caretData[1] === end) {
          return
        }

        if (start === null || end === null) {
          setCaretData([start, end])
          inputRef.current.setSelectionRange(start, end)
          return
        }

        const n = start === maxLength ? maxLength - 1 : start

        const _start = Math.min(n, maxLength - 1)
        const _end = n + 1

        setCaretData([_start, _end])
        inputRef.current.setSelectionRange(_start, _end)
      },
      [caretData, maxLength],
    )

    const onInputSelect = React.useCallback(
      (params: {
        e?: React.SyntheticEvent<HTMLInputElement>
        overrideStart?: number | null
        overrideEnd?: number | null
      }) => {
        if (!inputRef.current) {
          return
        }

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

          console.log('f')
          // inputRef.current.selectionStart = _start
          // inputRef.current.selectionEnd = _end
          inputRef.current.setSelectionRange(_start, _end)
          setCaretData([_start, _end])

          // setCaretPosition(_start, _end)
          return
        }

        if (caretData[0] === start && caretData[1] === end) {
          return
        }
        setCaretData([start, end])
      },
      [caretData, maxLength, setCaretPosition],
    )

    // Workaround to track the input's  selection even if Meta key is pressed
    // This was necessary due to the input `onSelect` only being called either 1. before Meta key is pressed or 2. after Meta key is released
    // TODO: track `Meta` and `Tab`
    const [isSpecialPressed, setIsSpecialPressed] =
      React.useState<boolean>(false)

    function syncTimeout() {
      return setTimeout(() => {
        if (!inputRef.current) {
          return
        }

        onInputSelect({
          overrideStart: inputRef.current.selectionStart,
          overrideEnd: inputRef.current.selectionEnd,
        })
      }, 2_0)
    }

    function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (SPECIAL_KEYS.includes(e.key)) {
        setIsSpecialPressed(true)

        syncTimeout()
      }

      // Sync to update UI
      if (isSpecialPressed) {
        syncTimeout()
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

          console.log('a')
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
          const start = Math.min(
            caretData[1],
            Math.min(value.length, maxLength - 1),
          )
          const end = Math.min(maxLength, start + 1)

          console.log('b')
          setCaretPosition(start, end)
        }
      }
    }

    function onInputFocus(e: React.SyntheticEvent<HTMLInputElement>) {
      if (!inputRef.current) {
        return
      }

      setIsFocused(true)

      // Default to the last slot or insert position
      const end = Math.min(maxLength, value.length + 1)
      const start = Math.max(0, end - 1)

      console.log('c')
      setCaretPosition(start, end)
    }

    function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
      const prevValue = e.currentTarget.value
      const newValue = e.target.value

      e.preventDefault()

      const valueToTest = allowSpaces
        ? newValue.replaceAll(' ', '').trim()
        : newValue
      if (
        regexp !== null &&
        valueToTest.length > 0 &&
        !regexp.test(valueToTest)
      ) {
        return
      }

      onChange(newValue.slice(0, maxLength))
      if (newValue.length === maxLength && onComplete) {
        onComplete()
      }

      if (
        prevValue.length === maxLength &&
        prevValue.length === newValue.length
      ) {
        const lastPos = newValue.length
        console.log('d')
        setCaretPosition(lastPos - 1, lastPos)
      }
    }

    function onInputKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {
      if (SPECIAL_KEYS.includes(e.key)) {
        setIsSpecialPressed(false)

        syncTimeout()
      }

      if (!inputRef.current) {
        return
      }

      const start = inputRef.current.selectionStart
      const end = inputRef.current.selectionEnd

      if (
        (e.key === 'Meta' || e.key === 'Alt' || e.key === 'Control') &&
        start !== null &&
        end !== null &&
        start === end
      ) {
        if (value.length === 0) {
          // Do nothing
        } else if (start === 0) {
          // console.log('e1')
          setCaretPosition(0, 1)
        } else if (start === maxLength) {
          // console.log('e2')
          setCaretPosition(maxLength - 1, maxLength)
        } else if (start === value.length) {
          // console.log('e3')
          setCaretPosition(value.length, value.length)
        }
      }
    }

    function onInputBlur() {
      setIsFocused(false)
      setCaretData([null, null])

      setIsSpecialPressed(false)

      onBlur?.()
    }

    function onInputBeforeInput(e: React.FormEvent<HTMLInputElement>) {
      if (e.currentTarget.selectionStart === e.currentTarget.selectionEnd) {
        if (value.length === maxLength) {
          e.nativeEvent.preventDefault()
          return
        }
      }
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
            // position: 'absolute',
            // inset: 0,
            // opacity: 0,
            pointerEvents: 'none',
            outline: 'none !important',

            // debug purposes
            color: 'black',
            background: 'white',
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
          onBeforeInput={onInputBeforeInput}
        />

        {JSON.stringify({ caretData })}
      </div>
    )
  },
)
OTPInput.displayName = 'OTPInput'
