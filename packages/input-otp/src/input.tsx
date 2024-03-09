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

    // Workarounds
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
    React.useImperativeHandle(ref, () => inputRef.current, [])
    React.useEffect(() => {
      const el = inputRef.current
      const container = containerRef.current

      if (!el || !container) {
        return
      }

      const _select = el.select.bind(el)
      el.select = () => {
        _select()
        // Workaround proxy to update UI as native `.select()` does not trigger focus event
        setMirrorSelectionStart(0)
        setMirrorSelectionEnd(el.value.length)
      }

      if (!document.getElementById('input-otp-style')) {
        const styleEl = document.createElement('style')
        styleEl.id = 'input-otp-style'
        document.head.appendChild(styleEl)
        styleEl.sheet?.insertRule(
          '[data-input-otp]::selection { background: transparent !important; }',
        )
        const autofillStyles =
          'background: transparent !important; text: transparent !important; border-color: transparent !important; opacity: 0 !important; box-shadow: none !important; -webkit-box-shadow: none !important; -webkit-text-fill-color: transparent !important;'
        styleEl.sheet?.insertRule(
          `[data-input-otp]:autofill { ${autofillStyles} }`,
        )
        styleEl.sheet?.insertRule(
          `[data-input-otp]:-webkit-autofill { ${autofillStyles} }`,
        )
        // iOS
        styleEl.sheet?.insertRule(
          `@supports (-webkit-touch-callout: none) { [data-input-otp] { letter-spacing: -.6em !important; } }`,
        )
        // PWM badges
        styleEl.sheet?.insertRule(
          `[data-input-otp] + * { pointer-events: all !important; }`,
        )
      }
      const updateRootHeight = () => {
        if (container) {
          container.style.setProperty('--root-height', `${el.clientHeight}px`)
        }
      }
      updateRootHeight()
      const resizeObserver = new ResizeObserver(updateRootHeight)
      resizeObserver.observe(el)

      setTimeout(() => {
        if (el) {
          setMirrorSelectionStart(el.selectionStart)
          setMirrorSelectionEnd(el.selectionEnd)
          setIsFocused(el === document.activeElement)
        }
      }, 20)

      return () => {
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
        hasPWMBadge ||
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
          console.log(entry.intersectionRatio)
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
      // Forcefully remove :autofill state
      syncTimeouts(() => {
        const e = new Event('input')
        inputRef.current?.dispatchEvent(e)
      })
    }, [value, isFocused])
    React.useEffect(() => {
      if (passwordManagerBehavior === 'none') {
        return
      }
      setTimeout(trackPWMBadge, 200)
      setTimeout(trackPWMBadge, 500)
      setTimeout(trackPWMBadge, 1000)
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

    // Run improved selection tracking while focused
    React.useEffect(() => {
      if (!isFocused) {
        return
      }

      const interval = setInterval(() => {
        if (inputRef.current && document.activeElement === inputRef.current) {
          setMirrorSelectionStart(inputRef.current.selectionStart)
          setMirrorSelectionEnd(inputRef.current.selectionEnd)
        }
      }, 50)

      return () => {
        clearInterval(interval)
      }
    }, [isFocused, mirrorSelectionStart, mirrorSelectionEnd])

    /** Event handlers */
    const _selectListener = React.useCallback(() => {
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

          let start = -1
          let end = -1

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
            inputRef.current.setSelectionRange(start, end, 'backward')
          }
        }
      }

      syncTimeouts(() => {
        setMirrorSelectionStart(inputRef.current?.selectionStart ?? null)
        setMirrorSelectionEnd(inputRef.current?.selectionEnd ?? null)
      })
    }, [maxLength, value.length])

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

    // Fix iOS pasting
    const _pasteListener = React.useCallback(
      (e: React.ClipboardEvent<HTMLInputElement>) => {
        if (!e.clipboardData) {
          return
        }

        const content = e.clipboardData.getData('text/plain')
        e.preventDefault()

        const start = inputRef.current?.selectionStart
        const end = inputRef.current?.selectionEnd

        const isReplacing = start !== end

        const newValueUncapped = isReplacing
          ? value.slice(0, start) + content + value.slice(end) // Replacing
          : value.slice(0, start) + content + value.slice(start) // Inserting
        const newValue = newValueUncapped.slice(0, maxLength)

        if (newValue.length > 0 && regexp && !regexp.test(newValue)) {
          return
        }

        onChange(newValue)

        const _start = Math.min(newValue.length, maxLength - 1)
        const _end = newValue.length

        syncTimeouts(() => {
          inputRef.current?.setSelectionRange(_start, _end)
          setMirrorSelectionStart(_start)
          setMirrorSelectionEnd(_end)
        })
      },
      [maxLength, onChange, regexp, value],
    )

    const _keyDownListener = React.useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
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
      },
      [value.length],
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
        // opacity: '.5',
        // caretColor: 'black',
        // padding: '0',
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
          inputMode={inputMode}
          pattern={regexp?.source}
          style={inputStyle}
          maxLength={maxLength}
          value={value}
          ref={inputRef}
          onChange={_changeListener}
          onSelect={e => {
            _selectListener()
            props.onSelect?.(e)
          }}
          onMouseOver={e => {
            setIsHoveringInput(true)
            props.onMouseOver?.(e)
          }}
          onMouseLeave={e => {
            setIsHoveringInput(false)
            props.onMouseLeave?.(e)
          }}
          onPaste={e => {
            _pasteListener(e)
            props.onPaste?.(e)
          }}
          onTouchEnd={e => {
            const isFocusing = document.activeElement === e.currentTarget
            if (isFocusing) {
              setTimeout(() => {
                _selectListener()
              }, 50)
            }

            props.onTouchEnd?.(e)
          }}
          onTouchMove={e => {
            const isFocusing = document.activeElement === e.currentTarget
            if (isFocusing) {
              setTimeout(() => {
                _selectListener()
              }, 50)
            }

            props.onTouchMove?.(e)
          }}
          onClick={e => {
            inputRef.current.__metadata__ = Object.assign(
              {},
              inputRef.current?.__metadata__,
              { lastClickTimestamp: Date.now() },
            )

            props.onClick?.(e)
          }}
          onDoubleClick={e => {
            const lastClickTimestamp =
              inputRef.current?.__metadata__?.lastClickTimestamp

            const isFocusing = document.activeElement === e.currentTarget
            if (
              lastClickTimestamp !== undefined &&
              isFocusing &&
              Date.now() - lastClickTimestamp <= 300 // Fast enough click
            ) {
              e.currentTarget.setSelectionRange(0, e.currentTarget.value.length)
              syncTimeouts(_selectListener)
            }

            props.onDoubleClick?.(e)
          }}
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
        _keyDownListener,
        _pasteListener,
        _selectListener,
        inputMode,
        inputStyle,
        maxLength,
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
