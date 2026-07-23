'use client'

import * as React from 'react'

/**
 * Intro sequence: a big standard OTP fades in, then varied OTP designs
 * replace it instantly in an accelerating rhythm — 1...2..3..4.5.6.7.8..
 * — before the curtain lifts and reveals the page.
 */

/* How long each slide holds, in ms (base rhythm x SPEED). Index 0 also
   gets the fade-in. */
const SPEED = 0.55
const HOLDS = [1150, 700, 700, 400, 400, 400, 400, 700].map(ms =>
  Math.round(ms * SPEED),
)
const CURTAIN_MS = 850

const mono = "var(--font-jetbrains), ui-monospace, Menlo, monospace"

const box = {
  display: 'grid',
  placeItems: 'center',
  fontFamily: mono,
  fontWeight: 500,
  color: '#fafafa',
} as const

/* 1 — standard: the classic bordered boxes */
function Standard() {
  return (
    <div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        {['7', '', '', '', '', ''].map((c, i) => (
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
    </div>
  )
}

/* 2 — keycaps: soft caps with a dash separator */
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
    <div>
      <div
        style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center' }}
      >
        {['7', '0', '', ''].map(cap)}
        <div style={{ width: 14, height: 3, background: '#3f3f46', borderRadius: 2 }} />
        {['', '', '', ''].map(cap)}
      </div>
    </div>
  )
}

/* 3 — underline: bare digits over rules */
function Underline() {
  return (
    <div>
      <div style={{ display: 'flex', gap: 22, justifyContent: 'center' }}>
        {['7', '0', '0', ''].map((c, i) => (
          <div key={i} style={{ width: 56, textAlign: 'center' }}>
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
    </div>
  )
}

/* 4 — grouped: one container, hairline dividers */
function Grouped() {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          border: '1px solid #27272a',
          borderRadius: 16,
          background: '#0c0c0e',
          overflow: 'hidden',
          width: 'fit-content',
          margin: '0 auto',
        }}
      >
        {['7', '0', '0', '4', '', ''].map((c, i) => (
          <div
            key={i}
            style={{
              ...box,
              width: 68,
              height: 86,
              fontSize: 38,
              borderLeft: i === 0 ? 'none' : '1px solid #1f1f23',
            }}
          >
            {c}
          </div>
        ))}
      </div>
    </div>
  )
}

/* 5 — masked: dots instead of digits */
function Masked() {
  return (
    <div>
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
        {[1, 1, 1, 0].map((filled, i) => (
          <div
            key={i}
            style={{
              ...box,
              width: 68,
              height: 84,
              border: '1px solid #232327',
              borderRadius: 14,
              background: '#0c0c0e',
            }}
          >
            {filled ? (
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#fafafa',
                }}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

/* 6 — pill: circular slots */
function Pill() {
  return (
    <div>
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
        {['9', '4', '1', '7', '0', '8', '', ''].map((c, i) => (
          <div
            key={i}
            style={{
              ...box,
              width: 76,
              height: 76,
              fontSize: 34,
              borderRadius: '50%',
              border: `1px solid ${c ? '#3f3f46' : '#232327'}`,
              background: '#0c0c0e',
            }}
          >
            {c}
          </div>
        ))}
      </div>
    </div>
  )
}

/* 7 — split: 2-2-2 groups */
function Split() {
  const cell = (c: string, i: number) => (
    <div
      key={i}
      style={{
        ...box,
        width: 62,
        height: 80,
        fontSize: 34,
        background: '#111113',
        borderRadius: 10,
      }}
    >
      {c}
    </div>
  )
  return (
    <div>
      <div style={{ display: 'flex', gap: 26, justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>{['3', '3'].map(cell)}</div>
        <div style={{ display: 'flex', gap: 6 }}>{['0', '9'].map(cell)}</div>
        <div style={{ display: 'flex', gap: 6 }}>{['5', ''].map(cell)}</div>
      </div>
    </div>
  )
}

/* 8 — terminal: everything filled, verified */
function Terminal() {
  return (
    <div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        {['7', '0', '0', '0', '0', '0', '0', '0'].map((c, i) => (
          <div
            key={i}
            style={{
              ...box,
              width: 72,
              height: 88,
              fontSize: 40,
              border: '1px solid #34d39955',
              borderRadius: 12,
              background: '#0a100d',
              color: '#34d399',
            }}
          >
            {c}
          </div>
        ))}
      </div>
    </div>
  )
}

const SLIDES = [Standard, Keycaps, Underline, Grouped, Masked, Pill, Split, Terminal]

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
