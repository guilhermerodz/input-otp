'use client'

import * as React from 'react'

import { REGEXP_ONLY_DIGITS } from './regexp'
import { syncTimeouts } from './sync-timeouts'
import { Metadata, OTPInputProps, SelectionType } from './types'

const PWM_BADGE_MARGIN_RIGHT = 18
const PWM_BADGE_SPACE_WIDTH = '40px'
// const PWM_BADGE_SPACE_WIDTH = '0px'

const PASSWORD_MANAGERS_SELECTORS = [
  '[data-lastpass-icon-root]', // LastPass
  'com-1password-button', // 1Password
  '[data-dashlanecreated]', // Dashlane
].join(',')

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
      passwordManagerBehavior = 'increase-width',
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
    const inputRef = React.useRef<
      HTMLInputElement & { __metadata__?: Metadata }
    >(null)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const pmwAreaRef = React.useRef<HTMLDivElement>(null)
    const initialLoadRef = React.useRef({
      value,
      onChange,
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
      let _prev: [
        number | null,
        number | null,
        'none' | 'forward' | 'backward',
      ] = [input.selectionStart, input.selectionEnd, input.selectionDirection]
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
              direction = c < _prev[1] ? 'backward' : 'forward'
              const offset = direction === 'backward' ? -1 : 0
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
        _prev = [s, e, dir]
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

    /** Password managers have a badge
     *  and I'll use this state to push them
     *  outside the input */
    const [hasPWMBadge, setHasPWMBadge] = React.useState(false)
    const [hasPWMBadgeSpace, setHasPWMBadgeSpace] = React.useState(false)
    const willPushPWMBadge = React.useMemo(
      () =>
        passwordManagerBehavior === 'increase-width' &&
        hasPWMBadge &&
        hasPWMBadgeSpace,
      [hasPWMBadge, hasPWMBadgeSpace, passwordManagerBehavior],
    )

    const pwmMetadata = React.useRef({
      done: false,
      refocused: false,
    })
    const trackPWMBadge = React.useCallback(() => {
      const input = inputRef.current
      if (
        !input ||
        passwordManagerBehavior === 'none' ||
        pwmMetadata.current.done
      ) {
        return
      }

      // Get the top right-center point of the input.
      // That is usually where most password managers place their badge.
      const rightCornerX =
        input.getBoundingClientRect().left + input.offsetWidth
      const centereredY =
        input.getBoundingClientRect().top + input.offsetHeight / 2
      const x = rightCornerX - PWM_BADGE_MARGIN_RIGHT
      const y = centereredY
      const maybeBadgeEl = document.elementFromPoint(x, y)

      // Do an extra search to check for famous password managers
      const pmws = document.querySelectorAll(PASSWORD_MANAGERS_SELECTORS)

      const maybeHasBadge =
        pmws.length > 0 ||
        // If the found element is not the input itself,
        // then we assume it's a password manager badge.
        // We are not sure. Most times it'll be.
        maybeBadgeEl !== input

      if (!maybeHasBadge) {
        return
      }

      // Once the PWM badge is detected,
      // this function won't run anymore.
      pwmMetadata.current.done = true
      setHasPWMBadge(true)
    }, [passwordManagerBehavior])
    React.useEffect(() => {
      const input = inputRef.current
      const pwmArea = pmwAreaRef.current
      if (
        !input ||
        !pwmArea ||
        !hasPWMBadge ||
        passwordManagerBehavior === 'none'
      ) {
        return
      }

      // For specific password managers,
      // the input has to be re-focused
      // to trigger a re-position of the badge.
      if (!pwmMetadata.current.refocused && document.activeElement === input) {
        const sel = [input.selectionStart, input.selectionEnd]
        input.blur()
        input.focus()
        // Recover the previous selection
        input.setSelectionRange(sel[0], sel[1])

        pwmMetadata.current.refocused = true
      }

      // Check if the PWM area is 100% visible
      const observer = new IntersectionObserver(
        entries => {
          const entry = entries[0]
          setHasPWMBadgeSpace(entry.intersectionRatio > 0.99)
        },
        { threshold: 1, root: null, rootMargin: '0px' },
      )

      observer.observe(pwmArea)

      return () => {
        observer.disconnect()
      }
    }, [hasPWMBadge, passwordManagerBehavior])

    /** Effects */
    React.useEffect(() => {
      syncTimeouts(() => {
        // Forcefully remove :autofill state
        inputRef.current?.dispatchEvent(new Event('input'))

        // Update the selection state
        const s = inputRef.current?.selectionStart
        const e = inputRef.current?.selectionEnd
        if (s !== null && e !== null) {
          setMirrorSelectionStart(s)
          setMirrorSelectionEnd(e)
        }
      })
    }, [value, isFocused])
    React.useEffect(() => {
      if (passwordManagerBehavior === 'none') {
        return
      }
      setTimeout(trackPWMBadge, 2000)
      setTimeout(trackPWMBadge, 5000)
    }, [passwordManagerBehavior, trackPWMBadge])
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

    /** Event handlers */
    const _changeListener = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value.slice(0, maxLength)
        if (newValue.length > 0 && regexp && !regexp.test(newValue)) {
          e.preventDefault()
          return
        }
        onChange(newValue)
        trackPWMBadge()
      },
      [maxLength, onChange, regexp, trackPWMBadge],
    )

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
        width: willPushPWMBadge
          ? `calc(100% + ${PWM_BADGE_SPACE_WIDTH})`
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
      [textAlign, willPushPWMBadge],
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
            if (inputRef.current) {
              const start = Math.min(
                inputRef.current.value.length,
                maxLength - 1,
              )
              const end = inputRef.current.value.length
              inputRef.current?.setSelectionRange(start, end)
              setMirrorSelectionStart(start)
              setMirrorSelectionEnd(end)
            }
            setIsFocused(true)
            setTimeout(trackPWMBadge, 200)

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
        inputMode,
        inputStyle,
        maxLength,
        mirrorSelectionEnd,
        mirrorSelectionStart,
        props,
        regexp?.source,
        trackPWMBadge,
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
          ref={pmwAreaRef}
          style={{
            position: 'absolute',
            top: 0,
            right: `calc(-1 * ${PWM_BADGE_SPACE_WIDTH})`,
            bottom: 0,
            left: '100%',
            pointerEvents: 'none',
            background: 'transparent',
          }}
        />

        {renderedChildren}

        <div className="absolute inset-0">{renderedInput}</div>
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
