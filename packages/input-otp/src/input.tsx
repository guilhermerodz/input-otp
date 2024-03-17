'use client'

import * as React from 'react'

import { NOSCRIPT_CSS_FALLBACK, mount } from './core'
import { REGEXP_ONLY_DIGITS } from './regexp'
import { OTPInputProps, RenderProps } from './types'
import { usePrevious } from './use-previous'

export const OTPInputContext = React.createContext<RenderProps>(
  {} as RenderProps,
)

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
      // pushPasswordManagerStrategy = 'increase-width',
      containerClassName,
      noScriptCSSFallback = NOSCRIPT_CSS_FALLBACK,

      render,
      children,

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

    /** Refs */
    const containerRef = React.useRef<HTMLDivElement>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(ref, () => inputRef.current, [])
    const [mounted, setMounted] = React.useState<ReturnType<typeof mount>>(null)

    /** Mirrors for UI rendering purpose only */
    const [mirrorHovering, setMirrorHovering] = React.useState(false)
    const [mirrorFocused, setMirrorFocused] = React.useState(false)
    const [mirrorSelectionStart, setMirrorSelectionStart] = React.useState<
      number | null
    >(null)
    const [mirrorSelectionEnd, setMirrorSelectionEnd] = React.useState<
      number | null
    >(null)

    /** Effects */
    React.useLayoutEffect(() => {
      if (!mounted && containerRef.current && inputRef.current) {
        setMounted(
          mount({
            isReact: true,
            container: containerRef.current,
            input: inputRef.current,
            maxLength,
            regexp,
            setValue: onChange,
            setMirrorSelectionStart,
            setMirrorSelectionEnd,
            setMirrorFocused,
            setMirrorHovering,
          }),
        )
      }
      return () => {
        mounted?.unmount()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mounted])
    React.useLayoutEffect(() => {
      if (mounted && containerRef.current && inputRef.current) {
        mounted.updateProps({
          container: containerRef.current,
          input: inputRef.current,
          maxLength,
          regexp,
          setValue: onChange,
          setMirrorSelectionStart,
          setMirrorSelectionEnd,
          setMirrorFocused,
          setMirrorHovering,
        })
      }
    }, [maxLength, mounted, onChange, regexp])
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

    // const pwmb = usePasswordManagerBadge({
    //   inputRef,
    //   pwmAreaRef: pwmAreaRef,
    //   pushPasswordManagerStrategy,
    //   isFocused,
    // })

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
        // width: pwmb.willPushPWMBadge
        //   ? `calc(100% + ${pwmb.PWM_BADGE_SPACE_WIDTH})`
        //   : '100%',
        width: '100%',
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
        fontFamily: 'monospace',
        fontVariantNumeric: 'tabular-nums',
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
      [textAlign],
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
          onChange={ev => {
            mounted.react.onChange(ev as unknown as Event)
          }}
        />
      ),
      [
        inputMode,
        inputStyle,
        maxLength,
        mirrorSelectionEnd,
        mirrorSelectionStart,
        mounted,
        props,
        regexp?.source,
        value,
      ],
    )

    const contextValue = React.useMemo<RenderProps>(() => {
      return {
        slots: Array.from({ length: maxLength }).map((_, slotIdx) => {
          const isActive =
            mirrorFocused &&
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
        isFocused: mirrorFocused,
        isHovering: !props.disabled && mirrorHovering,
      }
    }, [
      mirrorFocused,
      mirrorHovering,
      maxLength,
      mirrorSelectionEnd,
      mirrorSelectionStart,
      props.disabled,
      value,
    ])

    const renderedChildren = React.useMemo(() => {
      if (render) {
        return render(contextValue)
      }
      return (
        <OTPInputContext.Provider value={contextValue}>
          {children}
        </OTPInputContext.Provider>
      )
    }, [children, contextValue, render])

    return (
      <>
        {noScriptCSSFallback !== null && (
          <noscript>
            <style>{noScriptCSSFallback}</style>
          </noscript>
        )}

        <div
          ref={containerRef}
          data-input-otp-container
          style={rootStyle}
          className={containerClassName}
        >
          {/* <div
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
          /> */}

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
      </>
    )
  },
)
OTPInput.displayName = 'Input'
