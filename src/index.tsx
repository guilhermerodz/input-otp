import * as React from 'react'

const SPECIAL_KEYS = ['Meta', 'Alt', 'Control', 'Tab', 'Z']

interface OTPInputRenderProps {
  slots: { isActive: boolean; char: string | null }[]
  isFocused: boolean
  isHovering: boolean
}
interface OTPInputProps {
  id?: string
  name?: string
  onBlur?: (...args: any[]) => unknown
  disabled?: boolean

  value: string
  onChange: (value: string) => unknown

  maxLength: number
  regexp?: RegExp | null
  inputMode?: 'numeric' | 'text'
  allowSpaces?: boolean
  allowNavigation?: boolean

  onComplete?: (...args: any[]) => unknown

  render: (props: OTPInputRenderProps) => React.ReactElement

  containerClassName?: string
}
export const OTPInput = React.forwardRef<HTMLDivElement, OTPInputProps>(
  (
    {
      id,
      name,
      onBlur,
      disabled,

      value: _value,
      onChange,

      maxLength,
      regexp = /^\d+$/,
      inputMode = 'numeric',
      allowSpaces = false,
      allowNavigation = true,

      onComplete,

      render,

      containerClassName,

      ...props
    },
    ref,
  ) => {
    // console.count('rerender')

    // TODO: refactor like https://github.com/emilkowalski/vaul/blob/main/src/index.tsx
    /** Logic */
    const value = typeof _value === 'string' ? _value : ''

    const inputRef = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(
      ref,
      () => {
        const el = inputRef.current as HTMLInputElement

        // TODO: support `otp` SMS transport
        // if ('OTPCredential' in window) {
        //   const ac = new AbortController()
        //   navigator.credentials
        //     .get({
        //       ...{ otp: { transport: ['sms'] } },
        //       signal: ac.signal,
        //     })
        //     .then(otp => {
        //       input.value = otp.code
        //     })
        //     .catch(err => {
        //       console.log(err)
        //     })
        // }

        const _select = el.select.bind(el)
        el.select = () => {
          if (!allowNavigation) {
            // Cannot select all chars as navigation is disabled
            return
          }

          _select()
          // Proxy to update the caretData
          setSelectionMirror([0, el.value.length])
        }
        return el
      },
      [],
    )

    const [isHovering, setIsHovering] = React.useState<boolean>(false)
    const [isFocused, setIsFocused] = React.useState<boolean>(false)

    const [selectionMirror, setSelectionMirror] = React.useState<
      [number | null, number | null]
    >([null, null])

    // TODO: rename to `mutateInputSelectionAndSyncCaretData`
    const mutateInputSelectionAndUpdateMirror = React.useCallback(
      (start: number | null, end: number | null) => {
        if (!inputRef.current) {
          return
        }

        if (start === null || end === null) {
          setSelectionMirror([start, end])
          inputRef.current.setSelectionRange(start, end)
          return
        }

        const n = start === maxLength ? maxLength - 1 : start

        const _start = Math.min(n, maxLength - 1)
        const _end = n + 1

        if (selectionMirror[0] === _start && selectionMirror[1] === _end) {
          return
        }

        // mutate input selection
        inputRef.current.setSelectionRange(_start, _end)
        // force UI update
        setSelectionMirror([_start, _end])
      },
      [selectionMirror, maxLength],
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
          mutateInputSelectionAndUpdateMirror(start, end)
          return
        }

        if (selectionMirror[0] === start && selectionMirror[1] === end) {
          return
        }
        setSelectionMirror([start, end])
      },
      [selectionMirror, mutateInputSelectionAndUpdateMirror],
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
      if (SPECIAL_KEYS.indexOf(e.key) !== -1) {
        setIsSpecialPressed(true)

        syncTimeout()
      }

      // Sync to update UI
      if (isSpecialPressed) {
        syncTimeout()
      }

      if (e.metaKey && e.key.toLowerCase() === 'a' && !allowNavigation)  {
        e.preventDefault()
        return
      }

      if (
        !allowNavigation &&
        (e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight' ||
          e.key === 'ArrowUp' ||
          e.key === 'ArrowDown')
      ) {
        e.preventDefault()
        mutateInputSelectionAndUpdateMirror(
          selectionMirror[0],
          selectionMirror[1],
        )
      }

      if (!inputRef.current) {
        return
      }

      if (selectionMirror[0] === null) {
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
        allowNavigation &&
        !e.shiftKey &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault()

        if (selectionMirror[0] !== null && selectionMirror[1] !== null) {
          const start = Math.max(0, selectionMirror[0] - 1)
          const end = start + 1

          mutateInputSelectionAndUpdateMirror(start, end)
        }
      }
      if (
        e.key === 'ArrowRight' &&
        allowNavigation &&
        !e.shiftKey &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault()

        if (selectionMirror[0] !== null && selectionMirror[1] !== null) {
          const start = Math.min(
            selectionMirror[1],
            Math.min(value.length, maxLength - 1),
          )
          const end = Math.min(maxLength, start + 1)

          mutateInputSelectionAndUpdateMirror(start, end)
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

      mutateInputSelectionAndUpdateMirror(start, end)
    }

    function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
      const prevValue = e.currentTarget.value
      const newValue = e.target.value

      e.preventDefault()

      const valueToTest = allowSpaces
        ? newValue.replace(/ /g, '').trim()
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
        mutateInputSelectionAndUpdateMirror(lastPos - 1, lastPos)
      }
    }

    function onInputKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {
      if (SPECIAL_KEYS.indexOf(e.key) !== -1) {
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
          mutateInputSelectionAndUpdateMirror(0, 1)
        } else if (start === maxLength) {
          mutateInputSelectionAndUpdateMirror(maxLength - 1, maxLength)
        } else if (start === value.length) {
          mutateInputSelectionAndUpdateMirror(value.length, value.length)
        }
      }
    }

    function onInputBlur() {
      setIsFocused(false)
      setSelectionMirror([null, null])

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

    function onContainerClick(e: React.MouseEvent<HTMLInputElement>) {
      e.preventDefault()

      if (!inputRef.current) {
        return
      }

      if (document.activeElement === inputRef.current) {
        return
      }

      inputRef.current.focus()
    }

    const isSelected = React.useCallback(
      (slotIdx: number) => {
        return (
          selectionMirror[0] !== null &&
          selectionMirror[1] !== null &&
          slotIdx >= selectionMirror[0] &&
          slotIdx < selectionMirror[1]
        )
      },
      [selectionMirror],
    )

    const isCurrent = React.useCallback(
      (slotIdx: number) => {
        if (selectionMirror[0] === null || selectionMirror[1] === null) {
          return false
        }

        return slotIdx >= selectionMirror[0] && slotIdx < selectionMirror[1]
      },
      [selectionMirror],
    )

    /** JSX */
    const renderedChildren = React.useMemo<ReturnType<typeof render>>(() => {
      return render({
        slots: Array.from({ length: maxLength }).map((_, slotIdx) => ({
          char: value[slotIdx] !== undefined ? value[slotIdx] : null,
          isActive: isCurrent(slotIdx) || isSelected(slotIdx),
        })),
        isFocused,
        isHovering,
      })
    }, [
      disabled,
      isCurrent,
      isHovering,
      isFocused,
      isSelected,
      maxLength,
      render,
      value,
    ])

    // TODO: allow for custom container
    return (
      <div
        ref={ref}
        style={{
          position: 'relative',
          cursor: 'text',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
        onMouseDown={disabled ? undefined : onContainerClick}
        onMouseOver={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={containerClassName}
        {...props}
      >
        {renderedChildren}

        <input
          inputMode={inputMode}
          pattern={regexp ? regexp.source : undefined}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            pointerEvents: 'none',
            outline: 'none !important',

            // debug purposes
            // color: 'black',
            // background: 'white',
            // opacity: '1',
            // pointerEvents: 'all',
            // inset: undefined,
            // position: undefined,
          }}
          // autoComplete="" // TODO: add support
          autoComplete="one-time-code"
          name={name}
          id={id}
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

        {/* {JSON.stringify({ caretData: selectionMirror })} */}
      </div>
    )
  },
)
OTPInput.displayName = 'OTPInput'
