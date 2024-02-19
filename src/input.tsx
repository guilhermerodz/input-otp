import * as React from 'react'

import { syncTimeouts } from './sync-timeouts'
import { OTPInputProps, SelectionType } from './types'
import { REGEXP_ONLY_DIGITS } from './regexp'

export const OTPInput = React.forwardRef<HTMLInputElement, OTPInputProps>(
  (
    {
      value: uncheckedValue,
      onChange,

      maxLength,
      pattern = REGEXP_ONLY_DIGITS,
      inputMode = 'numeric',
      allowNavigation = true,

      autoFocus = false,

      onComplete,

      render,

      containerClassName,

      ...props
    },
    ref,
  ) => {
    // Workarounds
    const value = typeof uncheckedValue === 'string' ? uncheckedValue : ''
    const regexp = pattern
      ? typeof pattern === 'string'
        ? new RegExp(pattern)
        : pattern
      : null

    /** useRef */
    const inputRef = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(
      ref,
      () => {
        const el = inputRef.current as HTMLInputElement

        const _select = el.select.bind(el)
        el.select = () => {
          if (!allowNavigation) {
            // Cannot select all chars as navigation is disabled
            return
          }

          _select()
          // Workaround proxy to update UI as native `.select()` does not trigger focus event
          setMirrorSelectionStart(0)
          setMirrorSelectionEnd(el.value.length)
        }

        return el
      },
      [allowNavigation],
    )

    /** Mirrors for UI rendering purpose only */
    const [isHoveringContainer, setIsHoveringContainer] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const [mirrorSelectionStart, setMirrorSelectionStart] = React.useState<
      number | null
    >(null)
    const [mirrorSelectionEnd, setMirrorSelectionEnd] = React.useState<
      number | null
    >(null)

    /** Effects */
    React.useEffect(() => {
      if (value.length === maxLength) {
        onComplete?.(value)
      }
    }, [maxLength, onComplete, value])

    /** Event handlers */
    function _selectListener() {
      if (!inputRef.current) {
        return
      }

      const _start = inputRef.current.selectionStart
      const _end = inputRef.current.selectionEnd
      const isSelected = _start !== null && _end !== null

      if (value.length !== 0 && isSelected) {
        const isSingleCaret = _start === _end
        const isInsertMode = _start === value.length && value.length < maxLength

        if (isSingleCaret && !isInsertMode) {
          const caretPos = _start

          let start: number = -1
          let end: number = -1

          if (caretPos === 0) {
            start = 0
            end = 1
          } else if (caretPos === value.length) {
            start = value.length - 1
            end = value.length
          } else {
            start = caretPos
            end = caretPos + 1
          }

          if (start !== -1 && end !== -1) {
            inputRef.current.setSelectionRange(start, end)
          }
        }
      }

      syncTimeouts(() => {
        setMirrorSelectionStart(inputRef.current?.selectionStart ?? null)
        setMirrorSelectionEnd(inputRef.current?.selectionEnd ?? null)
      })
    }

    function _changeListener(e: React.ChangeEvent<HTMLInputElement>) {
      if (
        e.currentTarget.value.length > 0 &&
        regexp &&
        !regexp.test(e.currentTarget.value)
      ) {
        e.preventDefault()
        return
      }
      onChange(e.currentTarget.value)
    }

    function _keyDownListener(e: React.KeyboardEvent<HTMLInputElement>) {
      if (!inputRef.current) {
        return
      }

      const inputSel = [
        inputRef.current.selectionStart,
        inputRef.current.selectionEnd,
      ]
      if (inputSel[0] === null || inputSel[1] === null) {
        return
      }

      let selectionType: SelectionType
      if (inputSel[0] === inputSel[1]) {
        selectionType = SelectionType.CARET
      } else if (inputSel[1] - inputSel[0] === 1) {
        selectionType = SelectionType.CHAR
      } else if (inputSel[1] - inputSel[0] > 1) {
        selectionType = SelectionType.MULTI
      } else {
        throw new Error('Could not determine OTPInput selection type')
      }

      if (
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'Home' ||
        e.key === 'End'
      ) {
        if (!allowNavigation) {
          e.preventDefault()
        } else {
          if (
            e.key === 'ArrowLeft' &&
            selectionType === SelectionType.CHAR &&
            !e.shiftKey &&
            !e.metaKey &&
            !e.ctrlKey &&
            !e.altKey
          ) {
            e.preventDefault()

            const start = Math.max(inputSel[0] - 1, 0)
            const end = Math.max(inputSel[1] - 1, 1)

            inputRef.current.setSelectionRange(start, end)
          }

          if (
            e.altKey &&
            !e.shiftKey &&
            (e.key === 'ArrowLeft' || e.key === 'ArrowRight')
          ) {
            e.preventDefault()

            if (e.key === 'ArrowLeft') {
              inputRef.current.setSelectionRange(0, Math.min(1, value.length))
            }
            if (e.key === 'ArrowRight') {
              inputRef.current.setSelectionRange(
                Math.max(0, value.length - 1),
                value.length,
              )
            }
          }
        }
      }
    }

    function onContainerClick(e: React.MouseEvent<HTMLInputElement>) {
      e.preventDefault()
      if (!inputRef.current || document.activeElement === inputRef.current) {
        return
      }
      inputRef.current.focus()
    }

    /** Rendering */
    // TODO: memoize
    const renderedInput = (
      <input
        autoComplete={props.autoComplete || 'one-time-code'}
        {...props}
        inputMode={inputMode}
        pattern={regexp?.source}
        style={inputStyle}
        autoFocus={autoFocus}
        maxLength={maxLength}
        value={value}
        ref={inputRef}
        onChange={_changeListener}
        onSelect={_selectListener}
        // onSelectionChange={_selectListener}
        // onSelectStart={_selectListener}
        // onBeforeXrSelect={_selectListener}

        onInput={e => {
          syncTimeouts(_selectListener)

          props.onInput?.(e)
        }}
        onKeyDown={e => {
          _keyDownListener(e)
          syncTimeouts(_selectListener)

          props.onKeyDown?.(e)
        }}
        onKeyUp={e => {
          syncTimeouts(_selectListener)

          props.onKeyUp?.(e)
        }}
        onFocus={e => {
          inputRef.current?.setSelectionRange(
            Math.min(inputRef.current.value.length, maxLength - 1),
            inputRef.current.value.length,
          )
          setIsFocused(true)

          props.onFocus?.(e)
        }}
        onBlur={e => {
          setIsFocused(false)

          props.onBlur?.(e)
        }}
      />
    )

    const renderedChildren = React.useMemo<ReturnType<typeof render>>(() => {
      return render({
        slots: Array.from({ length: maxLength }).map((_, slotIdx) => {
          const isActive =
            isFocused &&
            mirrorSelectionStart !== null &&
            mirrorSelectionEnd !== null &&
            ((mirrorSelectionStart === mirrorSelectionEnd &&
              slotIdx === mirrorSelectionStart) ||
              (slotIdx >= mirrorSelectionStart && slotIdx < mirrorSelectionEnd))

          const char = value[slotIdx] !== undefined ? value[slotIdx] : null

          return {
            char,
            isActive,
            hasFakeCaret: isActive && char === null,
          }
        }),
        isFocused,
        isHovering: !props.disabled && isHoveringContainer,
      })
    }, [
      render,
      maxLength,
      isFocused,
      props.disabled,
      isHoveringContainer,
      value,
      mirrorSelectionStart,
      mirrorSelectionEnd,
    ])

    return (
      <div
        style={rootStyle({ disabled: props.disabled })}
        className={containerClassName}
        {...props}
        ref={ref}
        onMouseOver={(e: any) => {
          setIsHoveringContainer(true)
          props.onMouseOver?.(e)
        }}
        onMouseLeave={(e: any) => {
          setIsHoveringContainer(false)
          props.onMouseLeave?.(e)
        }}
        onMouseDown={(e: any) => {
          if (!props.disabled) {
            onContainerClick(e)
          }
          props.onMouseDown?.(e)
        }}
      >
        {renderedChildren}
        {renderedInput}
      </div>
    )
  },
)
OTPInput.displayName = 'Input'

const rootStyle = (params: { disabled?: boolean }) =>
  ({
    position: 'relative',
    cursor: params.disabled ? 'default' : 'text',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  } satisfies React.CSSProperties)

const inputStyle = {
  position: 'absolute',
  inset: 0,
  opacity: 0,
  pointerEvents: 'none',
  outline: 'none !important',
  // debugging purposes
  // color: 'black',
  // background: 'white',
  // opacity: '1',
  // pointerEvents: 'all',
  // inset: undefined,
  // position: undefined,
} satisfies React.CSSProperties
