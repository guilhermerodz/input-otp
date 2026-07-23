'use client'

import * as React from 'react'

/**
 * Intro sequence: a standard OTP fades in, then varied OTP designs replace
 * it instantly, each one slot wider than the last — 4 slots growing to 9,
 * landing on 700.000.000 to celebrate 700M downloads — before the curtain
 * lifts and reveals the page.
 */

/* How long each slide holds, in ms (base rhythm x SPEED). Index 0 also
   gets the fade-in. */
const SPEED = 0.55
const HOLDS = [1150, 700, 400, 400, 400, 1800].map(ms => Math.round(ms * SPEED))
const CURTAIN_MS = 850

const mono = 'var(--font-jetbrains), ui-monospace, Menlo, monospace'

const box = {
  display: 'grid',
  placeItems: 'center',
  fontFamily: mono,
  fontWeight: 500,
  color: '#fafafa',
} as const

/* 1 — standard: the classic bordered boxes (4 slots) */
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
        </div>
      ))}
    </div>
  )
}

/* 2 — keycaps: soft caps with a dash separator (5 slots, 2+3) */
function Keycaps() {
  const cap = (c: string, i: number) => (
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
    </div>
  )
  return (
    <div
      style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center' }}
    >
      {['7', '0'].map(cap)}
      <div style={{ width: 14, height: 3, background: '#3f3f46', borderRadius: 2 }} />
      {['', '', ''].map(cap)}
    </div>
  )
}

/* 3 — underline: bare digits over rules (6 slots) */
function Underline() {
  return (
    <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
      {['7', '0', '0', '', '', ''].map((c, i) => (
        <div key={i} style={{ width: 54, textAlign: 'center' }}>
          <div style={{ ...box, height: 68, fontSize: 44 }}>{c}</div>
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

/* 4 — masked: dots instead of digits (7 slots) */
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
          ) : null}
        </div>
      ))}
    </div>
  )
}

/* 5 — pill: circular slots (8 slots) */
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
    const id = setTimeout(() => setCount(c => c + 1), 42)
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
const GREEN_AT_MS = 350

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
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: green ? '#34d39988' : '#71717a',
            transition: 'background .5s ease',
          }}
        />
        {group(['0', '0', '0'], 1)}
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: green ? '#34d39988' : '#71717a',
            transition: 'background .5s ease',
          }}
        />
        {group(['0', '0', '0'], 2)}
      </div>
      <Typewriter text="million downloads" delay={GREEN_AT_MS} />
    </div>
  )
}

const SLIDES = [Standard, Keycaps, Underline, Masked, Pill, Celebration]

export function Preloader() {
  const [idx, setIdx] = React.useState(0)
  const [lifting, setLifting] = React.useState(false)
  const [gone, setGone] = React.useState(false)

  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setGone(true)
      return
    }

    const timeouts: ReturnType<typeof setTimeout>[] = []
    let at = 0
    HOLDS.forEach((hold, i) => {
      at += hold
      if (i < HOLDS.length - 1) {
        timeouts.push(setTimeout(() => setIdx(i + 1), at))
      } else {
        timeouts.push(setTimeout(() => setLifting(true), at))
        timeouts.push(setTimeout(() => setGone(true), at + CURTAIN_MS))
      }
    })
    return () => timeouts.forEach(clearTimeout)
  }, [])

  // No scrolling behind the curtain while it is up.
  React.useEffect(() => {
    if (gone) return
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = prev
    }
  }, [gone])

  if (gone) return null

  const Slide = SLIDES[idx]

  return (
    <div className={`xp-preloader ${lifting ? 'xp-preloader--lift' : ''}`}>
      <div key={idx} className={idx === 0 ? 'xp-pre-fade' : undefined}>
        <div className="xp-pre-scale">
          <Slide />
        </div>
      </div>
    </div>
  )
}
