'use client'

import * as React from 'react'
import { OTPInput, REGEXP_ONLY_DIGITS, type SlotProps } from 'input-otp'

const CORRECT = '123456'

function Slot(
  props: SlotProps & {
    error: boolean
    staticActive: boolean
    slotRef: (el: HTMLDivElement | null) => void
  },
) {
  return (
    <div
      ref={props.slotRef}
      className={`xp-slot ${props.staticActive ? 'xp-slot--active' : ''} ${
        props.error ? 'xp-slot--error' : ''
      }`}
    >
      {props.char !== null && (
        // Keyed on the char so every new digit replays the slide-in
        // (after Luxe UI's input-otp).
        <div key={props.char} className="xp-char-in">
          {props.char}
        </div>
      )}
      {props.hasFakeCaret && <div className="xp-caret" />}
    </div>
  )
}

/* Reports which slots are active, without setting state during render. */
function ActiveProbe({
  slots,
  onChange,
}: {
  slots: { isActive: boolean }[]
  onChange: (idxs: number[]) => void
}) {
  const key = slots.map(s => (s.isActive ? '1' : '0')).join('')
  React.useEffect(() => {
    onChange(slots.flatMap((s, i) => (s.isActive ? [i] : [])))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return null
}

type Ring = {
  x: number
  y: number
  w: number
  h: number
  radius: string
  visible: boolean
  /* True when the ring just appeared from hidden: position snaps into
     place and only the opacity fades — the glide is for moves between
     slots, not for arrival. */
  snap: boolean
}

export function HeroOtp() {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const slotRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const hintTimers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  const [value, setValue] = React.useState('')
  const [done, setDone] = React.useState(false)
  const [error, setError] = React.useState(false)
  // Locked from mount: the input cannot be focused or edited until the
  // hint hands the caret over — nothing shows as active before the
  // user's turn.
  const [locked, setLocked] = React.useState(true)
  const [active, setActive] = React.useState<number[]>([])
  const [ring, setRing] = React.useState<Ring>({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    radius: '16px',
    visible: false,
    snap: true,
  })
  const valueRef = React.useRef(value)
  valueRef.current = value
  const activeRef = React.useRef(active)
  activeRef.current = active

  /* The focus ring is one element gliding between slots (Luxe's shared
     indicator), measured off the real slot boxes so it survives the
     mobile size change. */
  const measureRing = React.useCallback(() => {
    const current = activeRef.current
    if (current.length === 1) {
      const el = slotRefs.current[current[0]]
      const wrap = wrapRef.current
      if (el && wrap) {
        const a = el.getBoundingClientRect()
        const b = wrap.getBoundingClientRect()
        setRing(prev => ({
          x: a.left - b.left,
          y: a.top - b.top,
          w: a.width,
          h: a.height,
          radius: getComputedStyle(el).borderRadius,
          visible: true,
          snap: !prev.visible,
        }))
      }
    } else {
      setRing(r => ({ ...r, visible: false }))
    }
  }, [])

  React.useLayoutEffect(measureRing, [active, measureRing])

  React.useEffect(() => {
    window.addEventListener('resize', measureRing)
    return () => window.removeEventListener('resize', measureRing)
  }, [measureRing])

  const clearHint = () => {
    hintTimers.current.forEach(clearTimeout)
    hintTimers.current = []
  }

  const at = (ms: number, fn: () => void) =>
    hintTimers.current.push(setTimeout(fn, ms))

  // Suggest the right code: type 1, then 2 at a human pace, then unlock
  // and hand the caret over on the third slot. The input is disabled
  // while the ghost is typing so nobody can fight it for the keyboard.
  const runHint = (delay: number) => {
    at(delay, () => {
      setLocked(true)
      setValue('1')
    })
    at(delay + 280, () => setValue('12'))
    at(delay + 760, () => setLocked(false))
    at(delay + 800, () => inputRef.current?.focus())
  }

  // On load, once the intro curtain is gone, the hint plays by itself.
  React.useEffect(() => {
    const begin = () => {
      if (valueRef.current !== '') return
      runHint(900)
    }
    const w = window as unknown as { __xpIntroDone?: boolean }
    if (w.__xpIntroDone) {
      begin()
    } else {
      window.addEventListener('xp:intro-done', begin, { once: true })
    }
    // Failsafe: never leave the input locked if the intro signal is lost.
    const failsafe = setTimeout(() => setLocked(false), 10000)
    return () => {
      window.removeEventListener('xp:intro-done', begin)
      clearTimeout(failsafe)
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
    runHint(850)
  }

  const multi = active.length > 1

  return (
    <>
      <div ref={wrapRef} style={{ position: 'relative' }}>
        <OTPInput
          ref={inputRef}
          value={value}
          disabled={locked}
          onChange={v => {
            // A real keystroke or paste takes over from any pending hint.
            clearHint()
            setLocked(false)
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
              <ActiveProbe slots={slots} onChange={setActive} />
              <div style={{ display: 'flex', gap: 10 }}>
                {slots.slice(0, 3).map((slot, idx) => (
                  <Slot
                    key={idx}
                    {...slot}
                    error={error}
                    staticActive={slot.isActive && multi}
                    slotRef={el => {
                      slotRefs.current[idx] = el
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: 24, color: '#3f3f46' }}>·</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {slots.slice(3).map((slot, idx) => (
                  <Slot
                    key={idx}
                    {...slot}
                    error={error}
                    staticActive={slot.isActive && multi}
                    slotRef={el => {
                      slotRefs.current[idx + 3] = el
                    }}
                  />
                ))}
              </div>
            </>
          )}
        />

        {/* The gliding focus ring */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: ring.w,
            height: ring.h,
            borderRadius: ring.radius,
            transform: `translate(${ring.x}px, ${ring.y}px)`,
            boxShadow: `0 0 0 2px ${error ? '#ef4444' : '#fafafa'}`,
            opacity: ring.visible ? 1 : 0,
            transition: ring.snap
              ? 'opacity 0.12s ease, box-shadow 0.2s ease'
              : 'transform 0.13s ease-in-out, opacity 0.12s ease, box-shadow 0.2s ease',
            pointerEvents: 'none',
          }}
        />
      </div>
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
