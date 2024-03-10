'use client'

import * as React from 'react'

import { REGEXP_ONLY_DIGITS } from './regexp'
import { syncTimeouts } from './sync-timeouts'
import { OTPInputProps } from './types'
import { usePasswordManagerBadge } from './use-pwm-badge'

export const OTPInput = React.forwardRef<HTMLInputElement, OTPInputProps>(
  (
    {
      value: uncheckedValue,
      onChange: uncheckedOnChange,
      maxLength,
      textAlign = 'left',
      pattern = REGEXP_ONLY_DIGITS,
      inputMode = 'numeric',
      onComplete,
      pushPasswordManagerStrategy = 'increase-width',
      render,
      containerClassName,
      ...props
    },
    ref,
  ) => {
    // Only used when `value` state is not provided
    const [internalValue, setInternalValue] = React.useState(
      typeof props.defaultValue === 'string' ? props.defaultValue : '',
    )

    // Definitions
    const value = uncheckedValue ?? internalValue
    const previousValue = usePrevious(value)
    const onChange = React.useCallback(
      (newValue: string) => {
        uncheckedOnChange?.(newValue)
        setInternalValue(newValue)
      },
      [uncheckedOnChange],
    )
    const regexp = React.useMemo(
      () =>
        pattern
          ? typeof pattern === 'string'
            ? new RegExp(pattern)
            : pattern
          : null,
      [pattern],
    )

    /** useRef */
    const inputRef = React.useRef<HTMLInputElement>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const pwmAreaRef = React.useRef<HTMLDivElement>(null)
    const initialLoadRef = React.useRef({
      value,
      onChange,
    })
    const inputMetadataRef = React.useRef<{
      prev: [number | null, number | null, 'none' | 'forward' | 'backward']
    }>({
      prev: [
        inputRef.current?.selectionStart,
        inputRef.current?.selectionEnd,
        inputRef.current?.selectionDirection,
      ],
    })
    React.useImperativeHandle(ref, () => inputRef.current, [])
    React.useEffect(() => {
      const input = inputRef.current
      const container = containerRef.current

      if (!input || !container) {
        return
      }

      // Sync input value
      if (initialLoadRef.current.value !== input.value) {
        initialLoadRef.current.onChange(input.value)
      }

      // Previous selection
      inputMetadataRef.current.prev = [
        input.selectionStart,
        input.selectionEnd,
        input.selectionDirection,
      ]
      function onDocumentSelectionChange() {
        if (document.activeElement !== input) {
          setMirrorSelectionStart(null)
          setMirrorSelectionEnd(null)
          return
        }

        // Aliases
        const _s = input.selectionStart
        const _e = input.selectionEnd
        const _dir = input.selectionDirection
        const _ml = input.maxLength
        const _val = input.value
        const _prev = inputMetadataRef.current.prev

        // Algorithm
        let start = -1
        let end = -1
        let direction: 'forward' | 'backward' | 'none' = undefined
        if (_val.length !== 0 && _s !== null && _e !== null) {
          const isSingleCaret = _s === _e
          const isInsertMode = _s === _val.length && _val.length < _ml

          if (isSingleCaret && !isInsertMode) {
            const c = _s
            if (c === 0) {
              start = 0
              end = 1
              direction = 'forward'
            } else if (c === _ml) {
              start = c - 1
              end = c
              direction = 'backward'
            } else if (_ml > 2 && _val.length > 2) {
              let offset = 0
              if (_prev[0] !== null && _prev[1] !== null) {
                direction = c < _prev[1] ? 'backward' : 'forward'
                const wasPreviouslyInserting =
                  _prev[0] === _prev[1] && _prev[0] < _ml
                if (direction === 'backward' && !wasPreviouslyInserting) {
                  offset = -1
                }
              }

              start = offset + c
              end = offset + c + 1
            }
          }

          if (start !== -1 && end !== -1 && start !== end) {
            inputRef.current.setSelectionRange(start, end, direction)
          }
        }

        // Finally, update the state
        const s = start !== -1 ? start : _s
        const e = end !== -1 ? end : _e
        const dir = direction ?? _dir
        setMirrorSelectionStart(s)
        setMirrorSelectionEnd(e)
        // Store the previous selection value
        inputMetadataRef.current.prev = [s, e, dir]
      }
      document.addEventListener('selectionchange', onDocumentSelectionChange, {
        capture: true,
      })

      // Set initial mirror state
      onDocumentSelectionChange()
      document.activeElement === input && setIsFocused(true)

      // Apply needed styles
      if (!document.getElementById('input-otp-style')) {
        const styleEl = document.createElement('style')
        styleEl.id = 'input-otp-style'
        document.head.appendChild(styleEl)

        if (styleEl.sheet) {
          const autofillStyles =
            'background: transparent !important; text: transparent !important; border-color: transparent !important; opacity: 0 !important; box-shadow: none !important; -webkit-box-shadow: none !important; -webkit-text-fill-color: transparent !important;'

          safeInsertRule(
            styleEl.sheet,
            '[data-input-otp]::selection { background: transparent !important; }',
          )
          safeInsertRule(
            styleEl.sheet,
            `[data-input-otp]:autofill { ${autofillStyles} }`,
          )
          safeInsertRule(
            styleEl.sheet,
            `[data-input-otp]:-webkit-autofill { ${autofillStyles} }`,
          )
          // iOS
          safeInsertRule(
            styleEl.sheet,
            `@supports (-webkit-touch-callout: none) { [data-input-otp] { letter-spacing: -.6em !important; } }`,
          )
          // PWM badges
          safeInsertRule(
            styleEl.sheet,
            `[data-input-otp] + * { pointer-events: all !important; }`,
          )
        }
      }
      // Track root height
      const updateRootHeight = () => {
        if (container) {
          container.style.setProperty(
            '--root-height',
            `${input.clientHeight}px`,
          )
        }
      }
      updateRootHeight()
      const resizeObserver = new ResizeObserver(updateRootHeight)
      resizeObserver.observe(input)

      return () => {
        document.removeEventListener(
          'selectionchange',
          onDocumentSelectionChange,
          { capture: true },
        )
        resizeObserver.disconnect()
      }
    }, [])

    /** Mirrors for UI rendering purpose only */
    const [isHoveringInput, setIsHoveringInput] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const [mirrorSelectionStart, setMirrorSelectionStart] = React.useState<
      number | null
    >(null)
    const [mirrorSelectionEnd, setMirrorSelectionEnd] = React.useState<
      number | null
    >(null)

    /** Effects */
    React.useEffect(() => {
      syncTimeouts(() => {
        // Forcefully remove :autofill state
        inputRef.current?.dispatchEvent(new Event('input'))

        // Update the selection state
        const s = inputRef.current?.selectionStart
        const e = inputRef.current?.selectionEnd
        const dir = inputRef.current?.selectionDirection
        if (s !== null && e !== null) {
          setMirrorSelectionStart(s)
          setMirrorSelectionEnd(e)
          inputMetadataRef.current.prev = [s, e, dir]
        }
      })
    }, [value, isFocused])

    React.useEffect(() => {
      if (previousValue === undefined) {
        return
      }

      if (
        value !== previousValue &&
        previousValue.length < maxLength &&
        value.length === maxLength
      ) {
        onComplete?.(value)
      }
    }, [maxLength, onComplete, previousValue, value])

    const pwmb = usePasswordManagerBadge({
      inputRef,
      pwmAreaRef: pwmAreaRef,
      pushPasswordManagerStrategy,
    })

    /** Event handlers */
    const _changeListener = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value.slice(0, maxLength)
        if (newValue.length > 0 && regexp && !regexp.test(newValue)) {
          e.preventDefault()
          return
        }
        onChange(newValue)
        pushPasswordManagerStrategy !== 'none' && pwmb.trackPWMBadge()
      },
      [maxLength, onChange, pushPasswordManagerStrategy, pwmb, regexp],
    )
    const _focusListener = React.useCallback(() => {
      if (inputRef.current) {
        const start = Math.min(inputRef.current.value.length, maxLength - 1)
        const end = inputRef.current.value.length
        inputRef.current?.setSelectionRange(start, end)
        setMirrorSelectionStart(start)
        setMirrorSelectionEnd(end)
      }
      setIsFocused(true)
      pushPasswordManagerStrategy !== 'none' &&
        setTimeout(pwmb.trackPWMBadge, 200)
    }, [maxLength, pushPasswordManagerStrategy, pwmb.trackPWMBadge])

    /** Styles */
    const rootStyle = React.useMemo<React.CSSProperties>(
      () => ({
        position: 'relative',
        cursor: props.disabled ? 'default' : 'text',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        pointerEvents: 'none',
        // clipPath: willPushPWMBadge ? 'inset(-2px)' : undefined,
      }),
      [props.disabled],
    )

    const inputStyle = React.useMemo<React.CSSProperties>(
      () => ({
        position: 'absolute',
        inset: 0,
        width: pwmb.willPushPWMBadge
          ? `calc(100% + ${pwmb.PWM_BADGE_SPACE_WIDTH})`
          : '100%',
        height: '100%',
        display: 'flex',
        textAlign,
        opacity: '1', // Mandatory for iOS hold-paste
        color: 'transparent',
        pointerEvents: 'all',
        background: 'transparent',
        caretColor: 'transparent',
        border: '0 solid transparent',
        outline: '0 solid transparent',
        boxShadow: 'none',
        lineHeight: '1',
        letterSpacing: '-.5em',
        fontSize: 'var(--root-height)',
        // letterSpacing: '-1em',
        // transform: 'scale(1.5)',
        // paddingRight: '100%',
        // paddingBottom: '100%',
        // debugging purposes
        // inset: undefined,
        // position: undefined,
        // color: 'black',
        // background: 'white',
        // opacity: '1',
        // caretColor: 'black',
        // padding: '0',
        // letterSpacing: 'unset',
      }),
      [pwmb.PWM_BADGE_SPACE_WIDTH, pwmb.willPushPWMBadge, textAlign],
    )

    /** Rendering */
    const renderedInput = React.useMemo(
      () => (
        <input
          autoComplete={props.autoComplete || 'one-time-code'}
          {...props}
          data-input-otp
          data-input-otp-mss={mirrorSelectionStart}
          data-input-otp-mse={mirrorSelectionEnd}
          inputMode={inputMode}
          pattern={regexp?.source}
          style={inputStyle}
          maxLength={maxLength}
          value={value}
          ref={inputRef}
          onChange={_changeListener}
          onMouseOver={e => {
            setIsHoveringInput(true)
            props.onMouseOver?.(e)
          }}
          onMouseLeave={e => {
            setIsHoveringInput(false)
            props.onMouseLeave?.(e)
          }}
          onFocus={e => {
            _focusListener()
            props.onFocus?.(e)
          }}
          onBlur={e => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
        />
      ),
      [
        _changeListener,
        _focusListener,
        inputMode,
        inputStyle,
        maxLength,
        mirrorSelectionEnd,
        mirrorSelectionStart,
        props,
        regexp?.source,
        value,
      ],
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
        isHovering: !props.disabled && isHoveringInput,
      })
    }, [
      isFocused,
      isHoveringInput,
      maxLength,
      mirrorSelectionEnd,
      mirrorSelectionStart,
      props.disabled,
      render,
      value,
    ])

    return (
      <div
        ref={containerRef}
        data-input-otp-container
        style={rootStyle}
        className={containerClassName}
      >
        <div
          ref={pwmAreaRef}
          style={{
            position: 'absolute',
            top: 0,
            right: `calc(-1 * ${pwmb.PWM_BADGE_SPACE_WIDTH})`,
            bottom: 0,
            left: '100%',
            pointerEvents: 'none',
            userSelect: 'none',
            background: 'transparent',
          }}
        />

        {renderedChildren}

        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
          }}
        >
          {renderedInput}
        </div>
      </div>
    )
  },
)
OTPInput.displayName = 'Input'

function usePrevious<T>(value: T) {
  const ref = React.useRef<T>()
  React.useEffect(() => {
    ref.current = value
  })
  return ref.current
}

function safeInsertRule(sheet: CSSStyleSheet, rule: string) {
  try {
    sheet.insertRule(rule)
  } catch {
    console.error('input-otp could not insert CSS rule:', rule)
  }
}
