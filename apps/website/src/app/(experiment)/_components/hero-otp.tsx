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
  const valueRef = React.useRef(value)
  valueRef.current = value

  const clearHint = () => {
    hintTimers.current.forEach(clearTimeout)
    hintTimers.current = []
  }

  const at = (ms: number, fn: () => void) =>
    hintTimers.current.push(setTimeout(fn, ms))

  // Suggest the right code: type 1, 2, then hand the caret over on the
  // third slot. The user notices it's their turn.
  const runHint = (delay: number) => {
    at(delay, () => setValue('1'))
    at(delay + 200, () => setValue('12'))
    at(delay + 400, () => inputRef.current?.focus())
  }

  // On load, once the intro curtain is gone, the hint plays by itself —
  // unless the visitor already started typing.
  React.useEffect(() => {
    const begin = () => {
      if (valueRef.current !== '') return
      if (document.activeElement === inputRef.current) return
      runHint(600)
    }
    const w = window as unknown as { __xpIntroDone?: boolean }
    if (w.__xpIntroDone) {
      begin()
    } else {
      window.addEventListener('xp:intro-done', begin, { once: true })
    }
    return () => {
      window.removeEventListener('xp:intro-done', begin)
      clearHint()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Wrong code: shake it off, then replay the suggestion.
  const failThenHint = () => {
    setError(true)
    at(450, () => {
      setError(false)
      setValue('')
    })
    runHint(800)
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
