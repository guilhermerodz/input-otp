'use client'

import * as React from 'react'

/**
 * Intro sequence: a standard OTP fades in, then varied OTP designs replace
 * it instantly, each one gaining slots and digits — 4 slots growing to 9,
 * landing on 700.000.000 — before the curtain lifts and reveals the page.
 *
 * Five reveal stories, one per /experiment route:
 *   1 — curved curtain up + the hero OTP auto-types 700 after the reveal
 *   2 — curtain splits from the middle (top half up, bottom half down)
 *   3 — zoom-through: the finale scales into the camera as the overlay fades
 *   4 — blinds: five vertical strips lift in a stagger
 *   5 — flat curtain up + a live download odometer in the corner
 */

export type IntroVariant = 1 | 2 | 3 | 4 | 5

const SPEED = 0.55
const CAPTION = 'million downloads'
const TYPE_MS = 42
const GREEN_AT_MS = 350
/* The finale holds until the caption finishes typing plus a reading beat —
   the curtain must never lift mid-word. */
const FINALE_HOLD = GREEN_AT_MS + CAPTION.length * TYPE_MS + 420
const HOLDS = [
  ...[1150, 700, 400, 400, 400].map(ms => Math.round(ms * SPEED)),
  FINALE_HOLD,
]

const LIFT_MS: Record<IntroVariant, number> = {
  1: 900,
  2: 800,
  3: 700,
  4: 1150,
  5: 850,
}

const mono = 'var(--font-jetbrains), ui-monospace, Menlo, monospace'

const box = {
  position: 'relative',
  display: 'grid',
  placeItems: 'center',
  fontFamily: mono,
  fontWeight: 500,
  color: '#fafafa',
} as const

/* The same blinking caret the hero uses, in the next empty slot. */
function Caret({ h }: { h: number }) {
  return (
    <span
      style={{
        position: 'absolute',
        width: 2,
        height: h,
        background: '#fafafa',
        animation: 'xp-blink 1s step-end infinite',
      }}
    />
  )
}

/* Digits fill one further each beat: 7, 70, 700, ••••, 700000, 700.000.000 */

/* 1 — standard: the classic bordered boxes (4 slots, 1 filled) */
function Standard() {
  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
      {['7', '', '', ''].map((c, i) => (
        <div
          key={i}
          style={{
            ...box,
            width: 72,
            height: 88,
            fontSize: 40,
            border: `1px solid ${i === 1 ? '#fafafa' : '#27272a'}`,
            borderRadius: 12,
            background: '#0c0c0e',
          }}
        >
          {c}
          {i === 1 && <Caret h={38} />}
        </div>
      ))}
    </div>
  )
}

/* 2 — keycaps: soft caps with a dash separator (5 slots, 2 filled) */
function Keycaps() {
  const cap = (c: string, i: number, caret?: boolean) => (
    <div
      key={i}
      style={{
        ...box,
        width: 66,
        height: 84,
        fontSize: 36,
        borderRadius: 14,
        background: 'linear-gradient(180deg, #17171a 0%, #0b0b0d 100%)',
        border: '1px solid #232327',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.06), 0 6px 14px rgba(0,0,0,.5)',
      }}
    >
      {c}
      {caret && <Caret h={34} />}
    </div>
  )
  return (
    <div
      style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center' }}
    >
      {cap('7', 0)}
      {cap('0', 1)}
      <div style={{ width: 14, height: 3, background: '#3f3f46', borderRadius: 2 }} />
      {cap('', 2, true)}
      {cap('', 3)}
      {cap('', 4)}
    </div>
  )
}

/* 3 — underline: bare digits over rules (6 slots, 3 filled) */
function Underline() {
  return (
    <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
      {['7', '0', '0', '', '', ''].map((c, i) => (
        <div key={i} style={{ width: 54, textAlign: 'center' }}>
          <div style={{ ...box, height: 68, fontSize: 44 }}>
            {c}
            {i === 3 && <Caret h={40} />}
          </div>
          <div
            style={{
              height: 3,
              borderRadius: 2,
              background: c ? '#fafafa' : '#3f3f46',
            }}
          />
        </div>
      ))}
    </div>
  )
}

/* 4 — masked: dots instead of digits (7 slots, 4 filled) */
function Masked() {
  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
      {[1, 1, 1, 1, 0, 0, 0].map((filled, i) => (
        <div
          key={i}
          style={{
            ...box,
            width: 62,
            height: 78,
            border: '1px solid #232327',
            borderRadius: 14,
            background: '#0c0c0e',
          }}
        >
          {filled ? (
            <div
              style={{
                width: 15,
                height: 15,
                borderRadius: '50%',
                background: '#fafafa',
              }}
            />
          ) : (
            i === 4 && <Caret h={32} />
          )}
        </div>
      ))}
    </div>
  )
}

/* 5 — pill: circular slots (8 slots, 6 filled) */
function Pill() {
  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
      {['7', '0', '0', '0', '0', '0', '', ''].map((c, i) => (
        <div
          key={i}
          style={{
            ...box,
            width: 66,
            height: 66,
            fontSize: 30,
            borderRadius: '50%',
            border: `1px solid ${c ? '#3f3f46' : '#232327'}`,
            background: '#0c0c0e',
          }}
        >
          {c}
          {i === 6 && <Caret h={26} />}
        </div>
      ))}
    </div>
  )
}

/* Caption that types itself out under the finale, after `delay` ms. */
function Typewriter({ text, delay }: { text: string; delay: number }) {
  const [started, setStarted] = React.useState(false)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    const id = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(id)
  }, [delay])

  React.useEffect(() => {
    if (!started || count >= text.length) return
    const id = setTimeout(() => setCount(c => c + 1), TYPE_MS)
    return () => clearTimeout(id)
  }, [started, count, text.length])

  return (
    <div
      style={{
        marginTop: 30,
        textAlign: 'center',
        fontFamily: mono,
        fontSize: 15,
        letterSpacing: '0.24em',
        color: '#86efac',
        minHeight: 20,
        whiteSpace: 'pre',
      }}
    >
      {text.slice(0, count)}
      <span
        style={{
          display: 'inline-block',
          width: 8,
          height: 15,
          marginLeft: 2,
          verticalAlign: 'text-bottom',
          background: count < text.length ? '#34d399' : 'transparent',
        }}
      />
    </div>
  )
}

/* 6 — the finale: 700.000.000, three grouped triplets joined by dots.
   Starts neutral and turns green the moment the caption starts typing. */
function Celebration() {
  const [green, setGreen] = React.useState(false)

  React.useEffect(() => {
    const id = setTimeout(() => setGreen(true), GREEN_AT_MS)
    return () => clearTimeout(id)
  }, [])

  const group = (digits: string[], key: number) => (
    <div
      key={key}
      style={{
        display: 'flex',
        border: `1px solid ${green ? '#34d39955' : '#3f3f46'}`,
        borderRadius: 14,
        background: green ? '#0a100d' : '#0c0c0e',
        overflow: 'hidden',
        boxShadow: green
          ? '0 0 34px rgba(52, 211, 153, 0.12)'
          : '0 0 34px rgba(250, 250, 250, 0.07)',
        transition: 'border-color .5s ease, background .5s ease, box-shadow .5s ease',
      }}
    >
      {digits.map((c, i) => (
        <div
          key={i}
          style={{
            ...box,
            width: 58,
            height: 76,
            fontSize: 34,
            color: green ? '#34d399' : '#fafafa',
            borderLeft: i === 0 ? 'none' : `1px solid ${green ? '#12251c' : '#1f1f23'}`,
            transition: 'color .5s ease, border-color .5s ease',
          }}
        >
          {c}
        </div>
      ))}
    </div>
  )

  const dot = (key: number) => (
    <div
      key={key}
      style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: green ? '#34d39988' : '#71717a',
        transition: 'background .5s ease',
      }}
    />
  )

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {group(['7', '0', '0'], 0)}
        {dot(3)}
        {group(['0', '0', '0'], 1)}
        {dot(4)}
        {group(['0', '0', '0'], 2)}
      </div>
      <Typewriter text={CAPTION} delay={GREEN_AT_MS} />
    </div>
  )
}

const SLIDES = [Standard, Keycaps, Underline, Masked, Pill, Celebration]

/* Variant 5: download counter easing up to 700.000.000 in the corner. */
function Odometer({ duration }: { duration: number }) {
  const [n, setN] = React.useState(0)

  React.useEffect(() => {
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(eased * 700_000_000))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [duration])

  return (
    <div
      style={{
        position: 'fixed',
        left: 28,
        bottom: 22,
        zIndex: 53,
        fontFamily: mono,
        fontSize: 13,
        color: '#71717a',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} downloads
    </div>
  )
}

/* Curved trailing edge for the variant-1 curtain. */
function CurtainBulge() {
  return (
    <svg
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        width: '100%',
        height: 120,
        display: 'block',
      }}
      aria-hidden="true"
    >
      <path d="M0 0 Q 50 10 100 0 Z" fill="#050506" />
    </svg>
  )
}

export function Preloader({ variant }: { variant: IntroVariant }) {
  const [idx, setIdx] = React.useState(0)
  const [phase, setPhase] = React.useState<'show' | 'lift' | 'gone'>('show')
  const phaseRef = React.useRef(phase)
  phaseRef.current = phase
  const timeouts = React.useRef<ReturnType<typeof setTimeout>[]>([])

  const startLift = React.useCallback(() => {
    if (phaseRef.current !== 'show') return
    timeouts.current.forEach(clearTimeout)
    setPhase('lift')
    setTimeout(() => {
      setPhase('gone')
      if (variant === 1) window.dispatchEvent(new Event('xp:intro-done'))
    }, LIFT_MS[variant])
  }, [variant])

  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('gone')
      return
    }

    const pending = timeouts.current
    let at = 0
    HOLDS.forEach((hold, i) => {
      at += hold
      if (i < HOLDS.length - 1) {
        pending.push(setTimeout(() => setIdx(i + 1), at))
      } else {
        pending.push(setTimeout(startLift, at))
      }
    })
    return () => pending.forEach(clearTimeout)
  }, [startLift])

  // Impatient visitors skip straight to the reveal.
  React.useEffect(() => {
    window.addEventListener('pointerdown', startLift)
    window.addEventListener('keydown', startLift)
    return () => {
      window.removeEventListener('pointerdown', startLift)
      window.removeEventListener('keydown', startLift)
    }
  }, [startLift])

  // No scrolling behind the curtain while it is up.
  React.useEffect(() => {
    if (phase === 'gone') return
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = prev
    }
  }, [phase])

  if (phase === 'gone') return null

  const Slide = SLIDES[idx]
  const lifting = phase === 'lift'
  const showDuration = HOLDS.reduce((a, b) => a + b, 0)

  /* The content leaves on its own — fading past the curtain instead of
     riding it. Variant 3 zooms through the camera instead. */
  const exitClass = variant === 3 ? 'xp-pre-zoomexit' : 'xp-pre-exit'

  return (
    <>
      {/* Panels (the curtain itself) */}
      {variant === 2 ? (
        <>
          <div
            className={`xp-panel xp-panel--top ${lifting ? 'xp-panel--top-lift' : ''}`}
          />
          <div
            className={`xp-panel xp-panel--bottom ${
              lifting ? 'xp-panel--bottom-lift' : ''
            }`}
          />
        </>
      ) : variant === 3 ? (
        <div className={`xp-panel xp-panel--full ${lifting ? 'xp-panel--fade' : ''}`} />
      ) : variant === 4 ? (
        <>
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={`xp-blind ${lifting ? 'xp-blind--lift' : ''}`}
              style={{ left: `${i * 20}%`, transitionDelay: `${i * 90}ms` }}
            />
          ))}
        </>
      ) : (
        <div className={`xp-panel xp-panel--full ${lifting ? 'xp-panel--up' : ''}`}>
          {variant === 1 && <CurtainBulge />}
        </div>
      )}

      {/* Content layer, above the panels */}
      <div className={`xp-pre-layer ${lifting ? exitClass : ''}`}>
        <div key={idx} className={idx === 0 ? 'xp-pre-fade' : undefined}>
          <div className="xp-pre-scale">
            <Slide />
          </div>
        </div>
      </div>

      {variant === 5 && !lifting && <Odometer duration={showDuration} />}
    </>
  )
}
