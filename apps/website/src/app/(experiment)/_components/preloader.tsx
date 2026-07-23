'use client'

import * as React from 'react'

/**
 * Intro: a slot machine. A lever on the right pulls itself, nine
 * motion-blurred reels land left to right on 700.000.000 and the frame
 * turns green. Then the lever becomes a caret that sweeps right-to-left,
 * clipping the machine away, and types "700 million downloads" in its
 * place — before a single curtain lifts to reveal the site.
 */

const TARGET = '700000000'
const PHRASE = '700 million downloads'
const TYPE_MS = 40

/* Timeline. The lever pull leads, reels start as it bottoms out. */
const REEL_DELAY = 380
const REEL_BASE = 850
const REEL_STEP = 150
const LANDED_AT = REEL_DELAY + REEL_BASE + (TARGET.length - 1) * REEL_STEP
const SWEEP_AT = LANDED_AT + 450
const SWEEP_MS = 620
const WRITE_AT = SWEEP_AT + SWEEP_MS + 80
const LIFT_AT = WRITE_AT + PHRASE.length * TYPE_MS + 560
const LIFT_MS = 850

const REEL_W = 58
const REEL_H = 76

const mono = 'var(--font-jetbrains), ui-monospace, Menlo, monospace'

/* One spinning digit strip. A couple of full 0-9 runs ending on the target
   digit; a single decelerating transform plays the whole spin, blurred
   while it is fast. */
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
        borderLeft:
          index % 3 === 0 ? 'none' : `1px solid ${green ? '#12251c' : '#1f1f23'}`,
        transition: 'border-color .5s ease',
      }}
    >
      <div
        className="xp-reel-strip"
        style={
          {
            '--final': `${-(rows.length - 1) * REEL_H}px`,
            '--dur': `${REEL_BASE + index * REEL_STEP}ms`,
            '--delay': `${REEL_DELAY}ms`,
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

/* The lever: a rod with a knob, pivoting at its base off the machine's
   right edge. It pulls itself once at the start, then hands its place to
   the sweeping caret. */
function Lever({ green, hidden }: { green: boolean; hidden: boolean }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        left: 'calc(100% + 26px)',
        top: '50%',
        width: 20,
        height: 86,
        transform: 'translateY(-56%)',
        opacity: hidden ? 0 : 1,
        transition: 'opacity .3s ease',
      }}
    >
      <div className="xp-lever-arm">
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 14,
            bottom: 6,
            width: 4,
            marginLeft: -2,
            borderRadius: 2,
            background: '#3f3f46',
            transition: 'background .5s ease',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            width: 16,
            height: 16,
            marginLeft: -8,
            borderRadius: '50%',
            background: green ? '#34d399' : '#71717a',
            transition: 'background .5s ease',
          }}
        />
      </div>
      {/* axle */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 0,
          width: 8,
          height: 8,
          marginLeft: -4,
          borderRadius: '50%',
          background: '#27272a',
        }}
      />
    </div>
  )
}

/* The phrase the caret leaves behind, typed left to right. */
function WriteLine() {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (count >= PHRASE.length) return
    const id = setTimeout(() => setCount(c => c + 1), TYPE_MS)
    return () => clearTimeout(id)
  }, [count])

  return (
    <div
      style={{
        fontFamily: mono,
        fontSize: 30,
        fontWeight: 500,
        letterSpacing: '0.04em',
        color: '#34d399',
        whiteSpace: 'pre',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {PHRASE.slice(0, count)}
      <span
        style={{
          display: 'inline-block',
          width: 2,
          height: 34,
          marginLeft: 3,
          background: '#34d399',
          boxShadow: '0 0 12px rgba(52, 211, 153, 0.6)',
          animation:
            count >= PHRASE.length ? 'xp-blink 1s step-end infinite' : undefined,
        }}
      />
    </div>
  )
}

/* The machine: three grouped triplets of reels joined by dots — the same
   frame the page's own OTP designs use. Neutral while spinning, green on
   landing; then the caret sweeps it away and writes the phrase. */
function Casino() {
  const [green, setGreen] = React.useState(false)
  const [sweep, setSweep] = React.useState(false)
  const [write, setWrite] = React.useState(false)

  React.useEffect(() => {
    const t = [
      setTimeout(() => setGreen(true), LANDED_AT),
      setTimeout(() => setSweep(true), SWEEP_AT),
      setTimeout(() => setWrite(true), WRITE_AT),
    ]
    return () => t.forEach(clearTimeout)
  }, [])

  const group = (from: number) => (
    <div
      key={from}
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
    <div style={{ position: 'relative' }}>
      <div
        className={sweep ? 'xp-machine--clip' : undefined}
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'center',
          visibility: write ? 'hidden' : undefined,
        }}
      >
        {group(0)}
        {dot(1)}
        {group(3)}
        {dot(2)}
        {group(6)}
      </div>

      <Lever green={green} hidden={sweep || write} />

      {sweep && !write && <div className="xp-sweep-caret" />}

      {write && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          <WriteLine />
        </div>
      )}
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
