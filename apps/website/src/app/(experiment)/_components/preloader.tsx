'use client'

import * as React from 'react'

/**
 * Intro: a slot machine. Nine reels spin behind the page's own OTP frame —
 * motion-blurred digit strips landing left to right on 700.000.000 — the
 * frame turns green, "million downloads" types itself out, and a single
 * curtain lifts to reveal the site.
 */

const TARGET = '700000000'
const CAPTION = 'million downloads'
const TYPE_MS = 42

/* Reel i lands at REEL_BASE + i * REEL_STEP. */
const REEL_BASE = 950
const REEL_STEP = 170
const LANDED_AT = REEL_BASE + (TARGET.length - 1) * REEL_STEP
/* Green + caption fire on landing; curtain waits for the words. */
const LIFT_AT = LANDED_AT + 150 + CAPTION.length * TYPE_MS + 520
const LIFT_MS = 850

const REEL_W = 58
const REEL_H = 76

const mono = 'var(--font-jetbrains), ui-monospace, Menlo, monospace'

/* One spinning digit strip. The strip is a couple of full 0-9 runs ending
   on the target digit; a single decelerating transform animation plays the
   whole spin, blurred while it is fast. */
function Reel({
  digit,
  index,
  green,
}: {
  digit: string
  index: number
  green: boolean
}) {
  const target = Number(digit)
  const runs = 2 + (index % 2)
  const rows: number[] = []
  for (let r = 0; r < runs * 10; r++) rows.push(r % 10)
  for (let d = 0; d <= target; d++) rows.push(d)

  return (
    <div
      style={{
        position: 'relative',
        width: REEL_W,
        height: REEL_H,
        overflow: 'hidden',
        borderLeft: index % 3 === 0 ? 'none' : `1px solid ${green ? '#12251c' : '#1f1f23'}`,
        transition: 'border-color .5s ease',
      }}
    >
      <div
        className="xp-reel-strip"
        style={
          {
            '--final': `${-(rows.length - 1) * REEL_H}px`,
            '--dur': `${REEL_BASE + index * REEL_STEP}ms`,
          } as React.CSSProperties
        }
      >
        {rows.map((d, i) => (
          <div
            key={i}
            style={{
              width: REEL_W,
              height: REEL_H,
              display: 'grid',
              placeItems: 'center',
              fontFamily: mono,
              fontWeight: 500,
              fontSize: 34,
              color: green ? '#34d399' : '#fafafa',
              transition: 'color .5s ease',
            }}
          >
            {d}
          </div>
        ))}
      </div>
      {/* Soft vignette so digits roll out of shadow, casino-style. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(10,10,12,.85) 0%, rgba(10,10,12,0) 28%, rgba(10,10,12,0) 72%, rgba(10,10,12,.85) 100%)',
        }}
      />
    </div>
  )
}

/* Caption that types itself out under the machine, after `delay` ms. */
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

/* The machine: three grouped triplets of reels joined by dots — the same
   frame the page's own OTP designs use. Neutral while spinning, green the
   moment the last reel lands. */
function Casino() {
  const [green, setGreen] = React.useState(false)

  React.useEffect(() => {
    const id = setTimeout(() => setGreen(true), LANDED_AT)
    return () => clearTimeout(id)
  }, [])

  const group = (from: number) => (
    <div
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
      {[0, 1, 2].map(i => (
        <Reel
          key={from + i}
          digit={TARGET[from + i]}
          index={from + i}
          green={green}
        />
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
        {group(0)}
        {dot(1)}
        {group(3)}
        {dot(2)}
        {group(6)}
      </div>
      <Typewriter text={CAPTION} delay={LANDED_AT + 150} />
    </div>
  )
}

export function Preloader() {
  const [phase, setPhase] = React.useState<'show' | 'lift' | 'gone'>('show')
  const phaseRef = React.useRef(phase)
  phaseRef.current = phase
  const timeouts = React.useRef<ReturnType<typeof setTimeout>[]>([])

  const startLift = React.useCallback(() => {
    if (phaseRef.current !== 'show') return
    timeouts.current.forEach(clearTimeout)
    setPhase('lift')
    setTimeout(() => setPhase('gone'), LIFT_MS)
  }, [])

  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('gone')
      return
    }
    const pending = timeouts.current
    pending.push(setTimeout(startLift, LIFT_AT))
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

  const lifting = phase === 'lift'

  return (
    <>
      {/* One simple curtain */}
      <div className={`xp-panel xp-panel--full ${lifting ? 'xp-panel--up' : ''}`} />

      {/* The machine floats above it and exits on its own */}
      <div className={`xp-pre-layer ${lifting ? 'xp-pre-exit' : ''}`}>
        <div className="xp-pre-fade">
          <div className="xp-pre-scale">
            <Casino />
          </div>
        </div>
      </div>
    </>
  )
}
