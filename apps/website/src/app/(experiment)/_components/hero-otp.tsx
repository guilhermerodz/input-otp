'use client'

import * as React from 'react'
import { OTPInput, REGEXP_ONLY_DIGITS, type SlotProps } from 'input-otp'

function Slot(props: SlotProps) {
  return (
    <div className={`xp-slot ${props.isActive ? 'xp-slot--active' : ''}`}>
      {props.char}
      {props.hasFakeCaret && <div className="xp-caret" />}
    </div>
  )
}

export function HeroOtp() {
  const [value, setValue] = React.useState('')
  const [done, setDone] = React.useState(false)

  // Match-cut with intro variant 1: after the curtain lifts, the hero
  // echoes the preloader by typing 700 on its own, then clearing.
  const touched = React.useRef(false)

  React.useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    const handler = () => {
      const digits = '700'
      for (let i = 1; i <= digits.length; i++) {
        timers.push(
          setTimeout(() => {
            if (!touched.current) setValue(digits.slice(0, i))
          }, 220 + i * 170),
        )
      }
      timers.push(
        setTimeout(() => {
          if (!touched.current) setValue('')
        }, 220 + digits.length * 170 + 900),
      )
    }
    window.addEventListener('xp:intro-done', handler)
    return () => {
      window.removeEventListener('xp:intro-done', handler)
      timers.forEach(clearTimeout)
    }
  }, [])

  return (
    <>
      <OTPInput
        value={value}
        onChange={v => {
          touched.current = true
          setValue(v)
          setDone(false)
        }}
        onComplete={() => setDone(true)}
        maxLength={6}
        pattern={REGEXP_ONLY_DIGITS}
        inputMode="numeric"
        autoComplete="one-time-code"
        containerClassName="xp-otp-container"
        render={({ slots }) => (
          <>
            <div style={{ display: 'flex', gap: 10 }}>
              {slots.slice(0, 3).map((slot, idx) => (
                <Slot key={idx} {...slot} />
              ))}
            </div>
            <div style={{ fontSize: 24, color: '#3f3f46' }}>·</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {slots.slice(3).map((slot, idx) => (
                <Slot key={idx} {...slot} />
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
          color: '#34d399',
        }}
      >
        {done && <span>✓ Code verified</span>}
      </div>
    </>
  )
}
