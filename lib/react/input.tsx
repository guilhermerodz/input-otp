import * as React from 'react'

import { onMount } from '../core/internal/input'
import { REGEXP_ONLY_DIGITS } from '../core/regexp'
import type {
  HTMLInputElementWithMetadata,
  UserDefinedMetadata,
} from '../core/internal/types'

import type { ReactOTPInputProps } from './types'

export const OTPInput = React.forwardRef<HTMLInputElement, ReactOTPInputProps>(
  (
    {
      // Props
      value,
      onChange,
      maxLength,
      pattern = REGEXP_ONLY_DIGITS,
      inputMode = 'numeric',
      onComplete,
      render,
      containerClassName,

      // HTML defaults
      autoComplete = 'one-time-code',
      ...props
    },
    ref,
  ) => {
    /** Workarounds */
    const regexp = React.useMemo(
      () =>
        pattern
          ? typeof pattern === 'string'
            ? new RegExp(pattern)
            : pattern
          : undefined,
      [pattern],
    )

    /** Refs */
    const containerRef = React.useRef<HTMLDivElement>(null)
    const inputRef = React.useRef<HTMLInputElementWithMetadata>(null)
    React.useImperativeHandle(ref, () => inputRef.current!, [])

    /** Mirror State for children-rendering-only purpose */
    const [mirrorFocused, setMirrorFocused] = React.useState(false)
    const [mirrorHovering, setMirrorHovering] = React.useState(false)
    const [mirrorSel, setMirrorSel] = React.useState<[number, number]>([-1, -1])

    const m = React.useMemo<UserDefinedMetadata>(() => {
      const m: UserDefinedMetadata = {
        maxLength,
        onChange: t => {
          onChange?.(t)
        },
        onComplete,
        regexp,
        updateMirror: (k, v) => {
          if (k === 'data-sel' && v !== undefined) {
            const [s, e] = v.split(',').map(Number)
            setMirrorSel([s, e])
          }
          if (k === 'data-is-focused') {
            setMirrorFocused(Boolean(v))
          }
          if (k === 'data-is-hovering') {
            setMirrorHovering(Boolean(v))
          }
        },
      }

      // update metadata if needed
      if (inputRef.current && inputRef.current.__metadata__) {
        inputRef.current.__metadata__ = Object.assign(
          inputRef.current.__metadata__,
          m,
        )
      }

      return m
    }, [maxLength, onChange, onComplete, regexp])

    /** Mount and Unmount */
    React.useEffect(() => {
      const container = containerRef.current
      const input = inputRef.current

      if (!container || !input) {
        return
      }

      const mounted = onMount({
        container,
        input,
        metadata: m,
      })

      return () => {
        // setTimeout(() => {
        // if (!inputRef.current) {
        mounted.unmount()
        // }
        // }, 3_000)
      }
    }, []) // Important: no deps in here

    /** JSX */
    const renderedInput = React.useMemo(
      () => (
        <input
          autoComplete={autoComplete}
          onChange={() => {}}
          {...props}
          data-input-otp
          ref={inputRef}
          inputMode={inputMode}
          pattern={regexp?.source}
          style={inputStyle}
          maxLength={maxLength}
          value={value}
        />
      ),
      [autoComplete, props, inputMode, regexp, maxLength, value],
    )

    const renderedChildren = React.useMemo<ReturnType<typeof render>>(() => {
      return render({
        slots: Array.from({ length: maxLength }).map((_, slotIdx) => {
          const isActive =
            mirrorFocused &&
            mirrorSel[0] !== null &&
            mirrorSel[1] !== null &&
            ((mirrorSel[0] === mirrorSel[1] && slotIdx === mirrorSel[0]) ||
              (slotIdx >= mirrorSel[0] && slotIdx < mirrorSel[1]))

          const _value = value || inputRef.current?.value
          const char =
            typeof _value === 'string'
              ? _value[slotIdx] !== undefined
                ? _value[slotIdx]
                : null
              : null

          return {
            char,
            isActive,
            hasFakeCaret: isActive && char === null,
          }
        }),
        isFocused: mirrorFocused,
        isHovering: !props.disabled && mirrorHovering,
      })
    }, [
      render,
      maxLength,
      mirrorFocused,
      props.disabled,
      mirrorHovering,
      value,
      mirrorSel,
    ])

    return (
      <div
        data-input-otp-container
        ref={containerRef}
        style={rootStyle({ disabled: props.disabled })}
        className={containerClassName}
      >
        {renderedChildren}
        {renderedInput}
      </div>
    )
  },
)
OTPInput.displayName = 'OTPInput'

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
  width: '100%',
  height: '100%',
  display: 'flex',
  textAlign: 'start',
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
} satisfies React.CSSProperties
