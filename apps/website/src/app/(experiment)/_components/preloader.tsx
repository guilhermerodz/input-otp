'use client'

import * as React from 'react'

/**
 * Intro: a slot machine. A lever on the right pulls itself, four big
 * motion-blurred reels land left to right on 700M and the frame turns
 * green with arcade win effects — a border beam racing the frame, a
 * double flash, a shake and radial sparks. Then the lever becomes a
 * caret that sweeps right-to-left, clipping the machine away, and types
 * a two-line thank-you in its place — before a single curtain lifts.
 */

const TARGET = ['7', '0', '0', 'M'] as const
const PHRASE = 'thank you for\n700M downloads!'
const TYPE_MS = 16

/* Timeline — phases overlap rather than queue: the sweep starts while
   the win burst is still playing, and the curtain lifts during the final
   blink instead of after it. */
const REEL_DELAY = 240
const REEL_BASE = 650
const REEL_STEP = 130
const LANDED_AT = REEL_DELAY + REEL_BASE + (TARGET.length - 1) * REEL_STEP
const SWEEP_AT = LANDED_AT + 350
const SWEEP_MS = 620
const WRITE_AT = SWEEP_AT + SWEEP_MS + 80
const LIFT_AT = WRITE_AT + PHRASE.length * TYPE_MS + 250
const LIFT_MS = 700

const REEL_W = 104
const REEL_H = 132

/* The intro plays once per visitor and then stays out of the way. The one way
   back in is the download counter down in "trusted at scale" — it is a button,
   and this is what it fires. Nothing else reopens the curtain. */
export const INTRO_REPLAY_EVENT = 'xp:intro-replay'

export function replayIntro() {
  window.dispatchEvent(new Event(INTRO_REPLAY_EVENT))
}

/* Whether asking would get you anything. Reduced motion never sees the intro —
   not on the first visit, not on request — so the counter renders its button
   disabled rather than dead. Client only: call it from an effect. */
export function canReplayIntro() {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/* How long a fresh replay ignores the skip handlers. A replay is one
   pointerdown away from being a double click, and a double click should not
   raise the curtain and drop it in the same gesture. */
const REPLAY_GRACE = 400

const mono = 'var(--font-jetbrains), ui-monospace, Menlo, monospace'

/* Lets the hero know the stage is clear (flag covers late subscribers). */
function announceIntroDone() {
  ;(window as unknown as { __xpIntroDone?: boolean }).__xpIntroDone = true
  window.dispatchEvent(new Event('xp:intro-done'))
}

/* Fired the moment the curtain starts moving, ~700ms before it is gone.
   The page's reveal cascade keys off this rather than the "done" signal so
   the hero is already in motion by the time the curtain clears it — the
   intro handing over instead of ending. */
function announceIntroLift() {
  window.dispatchEvent(new Event('xp:intro-lift'))
}

/* One spinning strip. A couple of full 0-9 runs ending on the target
   character; a single decelerating transform plays the whole spin,
   blurred while it is fast. */
function Reel({
  char,
  index,
  green,
}: {
  char: string
  index: number
  green: boolean
}) {
  const runs = 2 + (index % 2)
  const rows: (number | string)[] = []
  for (let r = 0; r < runs * 10; r++) rows.push(r % 10)
  if (char === 'M') {
    rows.push('M')
  } else {
    for (let d = 0; d <= Number(char); d++) rows.push(d)
  }

  return (
    <div
      style={{
        position: 'relative',
        width: REEL_W,
        height: REEL_H,
        overflow: 'hidden',
        borderLeft:
          index === 0 ? 'none' : `1px solid ${green ? '#12251c' : '#1f1f23'}`,
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
              fontSize: 62,
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

/* The lever, shaped like the classic cabinet part: a mount bracket on
   the machine's side, a horizontal arm out of it, then an elbow and a
   long rod up with the ball on top. The rod swings ~160deg around the
   elbow for the pull, then springs back. */
function Lever({ green, hidden }: { green: boolean; hidden: boolean }) {
  const rodColor = '#1c1c21'
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        left: '100%',
        top: '50%',
        width: 84,
        height: 150,
        transform: 'translateY(-50%)',
        opacity: hidden ? 0 : 1,
        transition: 'opacity .3s ease',
        pointerEvents: 'none',
      }}
    >
      {/* mount bracket hugging the cabinet side */}
      <div
        style={{
          position: 'absolute',
          left: 5,
          top: '50%',
          width: 15,
          height: 72,
          marginTop: -36,
          borderRadius: 8,
          background: '#27272a',
        }}
      />
      {/* horizontal arm out of the bracket */}
      <div
        style={{
          position: 'absolute',
          left: 17,
          top: '50%',
          width: 28,
          height: 10,
          marginTop: 4,
          borderRadius: '0 5px 5px 0',
          background: rodColor,
        }}
      />
      {/* rod + ball, pivoting at the elbow */}
      <div
        className="xp-lever-arm"
        style={{
          position: 'absolute',
          left: 36,
          top: '50%',
          width: 10,
          height: 98,
          marginTop: -84,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 5,
            background: rodColor,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: -12,
            width: 26,
            height: 26,
            marginLeft: -13,
            borderRadius: '50%',
            background: green ? '#34d399' : '#71717a',
            transition: 'background .5s ease',
          }}
        />
      </div>
    </div>
  )
}

/* Arcade win burst: radial sparks flying out of the machine's centre. */
function Sparks() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        pointerEvents: 'none',
      }}
    >
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const dist = 150 + (i % 3) * 55
        return (
          <span
            key={i}
            className="xp-spark"
            style={
              {
                '--dx': `${Math.cos(angle) * dist}px`,
                '--dy': `${Math.sin(angle) * dist}px`,
                transform: `rotate(${(angle * 180) / Math.PI}deg)`,
                animationDelay: `${(i % 4) * 30}ms`,
              } as React.CSSProperties
            }
          />
        )
      })}
    </div>
  )
}

/* The two balanced lines the caret leaves behind, typed left to right —
   the caret rides the text across the line break. */
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
        fontSize: 34,
        lineHeight: 1.4,
        fontWeight: 500,
        letterSpacing: '0.04em',
        color: '#34d399',
        whiteSpace: 'pre',
        /* Both lines' worth of height from the first character, so the
           block doesn't jump when typing crosses the line break. */
        height: '2.8em',
      }}
    >
      {PHRASE.slice(0, count)}
      <span
        style={{
          display: 'inline-block',
          width: 3,
          height: 34,
          marginLeft: 4,
          verticalAlign: '-0.12em',
          background: '#34d399',
          boxShadow: '0 0 14px rgba(52, 211, 153, 0.6)',
          animation:
            count >= PHRASE.length ? 'xp-blink 1s step-end infinite' : undefined,
        }}
      />
    </div>
  )
}

/* The machine: one big group of four reels — the same frame the page's
   OTP designs use. Neutral while spinning; on landing it goes green with
   the arcade win burst, then the caret sweeps it away and writes the
   phrase. */
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

  return (
    <div
      style={{ position: 'relative' }}
      className={green && !write ? 'xp-win-shake' : undefined}
    >
      <div
        className={sweep ? 'xp-machine--clip' : undefined}
        style={{
          position: 'relative',
          visibility: write ? 'hidden' : undefined,
        }}
      >
        <div
          style={{
            display: 'flex',
            border: `1px solid ${green ? '#34d39955' : '#3f3f46'}`,
            borderRadius: 18,
            background: green ? '#0a100d' : '#0c0c0e',
            overflow: 'hidden',
            boxShadow: green
              ? '0 0 54px rgba(52, 211, 153, 0.18)'
              : '0 0 34px rgba(250, 250, 250, 0.07)',
            transition:
              'border-color .5s ease, background .5s ease, box-shadow .5s ease',
          }}
        >
          {TARGET.map((c, i) => (
            <Reel key={i} char={c} index={i} green={green} />
          ))}
        </div>

        {/* Border beam racing the frame on win */}
        {green && (
          <div className="xp-beam-ring" aria-hidden>
            <div className="xp-beam-spin" />
          </div>
        )}
      </div>

      {/* Win flash + sparks, once; they outlive the sweep start */}
      {green && !write && (
        <>
          <div className="xp-win-flash" aria-hidden />
          <Sparks />
        </>
      )}

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
  /* A replay is the show running again, not the page arriving. The reveal
     cascade and the hero's typing hint both key off the intro's signals and
     both have already had their turn, so a replay stays quiet — it borrows
     the curtain and hands the page back exactly as it found it. */
  const replaying = React.useRef(false)
  const guardUntil = React.useRef(0)
  const timeouts = React.useRef<ReturnType<typeof setTimeout>[]>([])

  /* Drains in place: the mount effect's cleanup holds this same array. */
  const clearPending = () => timeouts.current.splice(0).forEach(clearTimeout)

  const startLift = React.useCallback(() => {
    if (phaseRef.current !== 'show') return
    clearPending()
    // Recorded only once the intro has actually played through (or been
    // skipped) — writing at mount made Strict Mode's second effect run
    // read its own flag and kill the intro in dev.
    try {
      localStorage.setItem('xp-intro-seen', '1')
    } catch {}
    setPhase('lift')
    if (!replaying.current) announceIntroLift()
    timeouts.current.push(
      setTimeout(() => {
        setPhase('gone')
        if (!replaying.current) announceIntroDone()
        replaying.current = false
      }, LIFT_MS),
    )
  }, [])

  const replay = React.useCallback(() => {
    // Only from a settled page: mid-intro there is nothing to reopen, and the
    // counter that asks for this is behind the curtain anyway.
    if (phaseRef.current !== 'gone' || !canReplayIntro()) return
    replaying.current = true
    guardUntil.current = Date.now() + REPLAY_GRACE
    clearPending()
    setPhase('show')
    timeouts.current.push(setTimeout(startLift, LIFT_AT))
  }, [startLift])

  React.useEffect(() => {
    // The blocking script in the layout already hid the overlay pre-paint;
    // this just unmounts it. Read-only here — the flag is written when
    // the intro finishes, so this effect stays idempotent.
    let seen = document.documentElement.classList.contains('xp-intro-seen')
    try {
      seen = seen || localStorage.getItem('xp-intro-seen') === '1'
    } catch {
      // storage unavailable: play the intro every time
    }
    const pending = timeouts.current
    if (
      seen ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setPhase('gone')
      announceIntroDone()
    } else {
      pending.push(setTimeout(startLift, LIFT_AT))
    }
    // Cleans up either way: a replay schedules into this same list long after
    // the first visit skipped straight past it.
    return () => pending.forEach(clearTimeout)
  }, [startLift])

  // Impatient visitors skip straight to the reveal — but a replay gets a
  // moment's grace first, so the second half of a double click on the counter
  // does not close what the first half opened.
  React.useEffect(() => {
    const skip = () => {
      if (Date.now() < guardUntil.current) return
      startLift()
    }
    window.addEventListener('pointerdown', skip)
    window.addEventListener('keydown', skip)
    return () => {
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
    }
  }, [startLift])

  React.useEffect(() => {
    window.addEventListener(INTRO_REPLAY_EVENT, replay)
    return () => window.removeEventListener(INTRO_REPLAY_EVENT, replay)
  }, [replay])

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
  /* Repeat visitors have the overlay hidden outright by a rule set before
     first paint; this is how a replay says it means to be here. */
  const asked = replaying.current ? '' : undefined

  return (
    <>
      {/* One simple curtain */}
      <div
        className={`xp-panel xp-panel--full ${lifting ? 'xp-panel--up' : ''}`}
        data-xp-replay={asked}
      />

      {/* The machine floats above it and exits on its own */}
      <div
        className={`xp-pre-layer ${lifting ? 'xp-pre-exit' : ''}`}
        data-xp-replay={asked}
      >
        <div className="xp-pre-fade">
          <div className="xp-pre-scale">
            <Casino />
          </div>
        </div>
      </div>
    </>
  )
}
