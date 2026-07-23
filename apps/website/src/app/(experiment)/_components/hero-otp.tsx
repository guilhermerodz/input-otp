'use client'

import * as React from 'react'
import { OTPInput, REGEXP_ONLY_DIGITS, type SlotProps } from 'input-otp'

const CORRECT = '123456'

function Slot(props: SlotProps & { error: boolean }) {
  return (
    <div
      className={`xp-slot ${props.isActive ? 'xp-slot--active' : ''} ${
        props.error ? 'xp-slot--error' : ''
      }`}
    >
      {props.char}
      {props.hasFakeCaret && <div className="xp-caret" />}
    </div>
  )
}

export function HeroOtp() {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const hintTimers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  const [value, setValue] = React.useState('')
  const [done, setDone] = React.useState(false)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    const timers = hintTimers.current
    return () => timers.forEach(clearTimeout)
  }, [])

  const clearHint = () => {
    hintTimers.current.forEach(clearTimeout)
    hintTimers.current = []
  }

  // Wrong code: shake it off, then suggest the right one — type 1, 2 and
  // hand the caret over on the third slot. The user notices it's their turn.
  const failThenHint = () => {
    setError(true)
    const at = (ms: number, fn: () => void) =>
      hintTimers.current.push(setTimeout(fn, ms))
    at(450, () => {
      setError(false)
      setValue('')
    })
    at(800, () => setValue('1'))
    at(1000, () => setValue('12'))
    at(1200, () => inputRef.current?.focus())
  }

  return (
    <>
      <OTPInput
        ref={inputRef}
        value={value}
        onChange={v => {
          // A real keystroke or paste takes over from any pending hint.
          clearHint()
          setValue(v)
          setDone(false)
          setError(false)
        }}
        onComplete={(v: string) => {
          if (v === CORRECT) {
            setDone(true)
          } else {
            clearHint()
            failThenHint()
          }
        }}
        maxLength={6}
        pattern={REGEXP_ONLY_DIGITS}
        inputMode="numeric"
        autoComplete="one-time-code"
        containerClassName={`xp-otp-container ${error ? 'xp-otp-shake' : ''}`}
        render={({ slots }) => (
          <>
            <div style={{ display: 'flex', gap: 10 }}>
              {slots.slice(0, 3).map((slot, idx) => (
                <Slot key={idx} {...slot} error={error} />
              ))}
            </div>
            <div style={{ fontSize: 24, color: '#3f3f46' }}>·</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {slots.slice(3).map((slot, idx) => (
                <Slot key={idx} {...slot} error={error} />
              ))}
            </div>
          </>
        )}
      />
      <div
        style={{
          height: 28,
          display: 'grid',
          placeItems: 'center',
          fontSize: 14,
          color: error ? '#f87171' : '#34d399',
        }}
      >
        {done && <span>✓ Code verified</span>}
        {error && <span>✗ Wrong code</span>}
      </div>
    </>
  )
}
