'use client'

/* "Trusted at scale". 700M is a number nobody feels, so the section does not
   print it — it prints the count, all nine digits, moving at the speed the
   package is actually installed. Nine drums geared to each other, the ones drum
   turning five and a half times a second and smeared out because that is what a
   wheel that fast looks like. Nobody reads the last two digits. Nobody is meant
   to: the blur is the statistic. */

import { useEffect, useRef } from 'react'

/* Read off the npm registry API on 2026-07-24: every daily figure summed from
   the first publish through 2026-07-23, and the last full week. Two of those
   days came back as 0 — registry gaps, not quiet days — so the total is a
   floor, which is the side to be wrong on. The counter extrapolates from these
   two numbers; npm reports daily, not per install, so the digits are a model of
   a real rate rather than a feed. Re-read both when they go stale. */
const ANCHOR_AT = Date.parse('2026-07-24T00:00:00Z')
const ANCHOR_TOTAL = 761_799_962
const WEEKLY = 32_942_964

const PER_SECOND = WEEKLY / (7 * 24 * 60 * 60)

/* Rounded off the anchor rather than written out, so refreshing the week's
   figure moves the headline with it. */
const WEEKLY_SHORT = `${Math.round(WEEKLY / 1e6)}M`

/* Holds until the total crosses a billion, which is years out and will mean
   re-reading the anchor anyway. */
const DIGITS = String(ANCHOR_TOTAL).length

/* Fixed locale: this renders on the server too, and a count that groups
   differently on the two passes is a hydration mismatch. */
const NUMBER = new Intl.NumberFormat('en-US')

const SHADCN_URL = 'https://ui.shadcn.com/docs/components/input-otp'

/* How long the first paint's figure takes to catch up to the live one. */
const SPIN_MS = 1400

function totalAt(ms: number) {
  return ANCHOR_TOTAL + ((ms - ANCHOR_AT) / 1000) * PER_SECOND
}

/* `still` marks the one frame reduced motion gets: nothing will move after it,
   so anything that would normally be caught mid-motion has to be drawn at rest
   instead. */
type Frame = { total: number; still?: boolean }

/* A rAF loop writing to the DOM by hand. At 54 downloads a second the number
   changes every single frame, and re-rendering React sixty times a second to
   move one digit is not a trade worth making.

   The server has no clock it can share, so the markup ships ANCHOR_TOTAL and
   the loop eases from there up to the live figure over the first moment on
   screen — the catch-up is the reveal, not a glitch to hide. */
function useDownloadClock(onFrame: (frame: Frame) => void) {
  const hostRef = useRef<HTMLElement>(null)
  const latest = useRef(onFrame)
  latest.current = onFrame

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const live = totalAt(Date.now())

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      latest.current({ total: live, still: true })
      return
    }

    let raf = 0
    let startedAt = 0

    const loop = (now: number) => {
      if (!startedAt) startedAt = now
      const t = now - startedAt
      /* Real elapsed time, not accumulated frames: scrolling the section away
         stops the loop but not the installs, so coming back catches up. */
      const since = (t / 1000) * PER_SECOND
      const spin = t < SPIN_MS ? 1 - (1 - t / SPIN_MS) ** 3 : 1
      latest.current({ total: ANCHOR_TOTAL + (live - ANCHOR_TOTAL) * spin + since })
      raf = requestAnimationFrame(loop)
    }

    /* Nothing worth counting frames for while the section is off screen. */
    const observer = new IntersectionObserver(entries => {
      const on = entries[entries.length - 1].isIntersecting
      if (on && !raf) raf = requestAnimationFrame(loop)
      if (!on && raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    })
    observer.observe(host)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [])

  return hostRef
}

/* The drums ---------------------------------------------------------------- */

const CELLS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0]

/* A drum's resting position is its digit; it only turns as the drum below it
   comes up on a wrap. Above a couple of turns a second the snap is pointless —
   it never rests — so those run continuously instead.

   The turn is a fixed number of milliseconds, not a fixed slice of the digit:
   a share of the digit means the hundreds drum turns for four minutes and the
   ten-millions drum for most of a week, and a drum caught halfway between two
   numbers for four minutes just looks broken. */
const TURN_MS = 320

function drumAt(total: number, power: number, still = false) {
  const perSecond = PER_SECOND / 10 ** power
  const x = total / 10 ** power
  if (still) return Math.floor(x) % 10
  if (perSecond > 2.5) return x % 10
  const digit = Math.floor(x) % 10
  const frac = x - Math.floor(x)
  const turn = Math.min((TURN_MS / 1000) * perSecond, 1)
  return digit + (frac > 1 - turn ? (frac - (1 - turn)) / turn : 0)
}

function drumSpin(power: number) {
  const speed = PER_SECOND / 10 ** power
  if (speed > 20) return 'fast'
  if (speed > 2.5) return 'soft'
  return 'still'
}

function shift(position: number) {
  return `translate3d(0, calc(var(--st-cell) * ${-position}), 0)`
}

export function StatsOdometer() {
  const drums = useRef<(HTMLSpanElement | null)[]>([])

  const hostRef = useDownloadClock(frame => {
    for (let j = 0; j < DIGITS; j++) {
      const drum = drums.current[j]
      if (drum) drum.style.transform = shift(drumAt(frame.total, DIGITS - 1 - j, frame.still))
    }
  })

  return (
    <section className="xp-st-section" ref={hostRef}>
      <div className="xp-st-eyebrow xp-mono">
        TRUSTED AT SCALE<span style={{ color: '#3f3f46' }}>_</span>
      </div>

      <div className="xp-st-odo xp-mono" aria-hidden="true">
        {Array.from({ length: DIGITS }, (_, j) => {
          const power = DIGITS - 1 - j
          return (
            <span className="xp-st-odo-group" key={power}>
              {j > 0 && power % 3 === 2 && <span className="xp-st-odo-sep">,</span>}
              <span className="xp-st-odo-col" data-spin={drumSpin(power)}>
                <span
                  className="xp-st-odo-drum"
                  ref={el => {
                    drums.current[j] = el
                  }}
                  style={{ transform: shift(drumAt(ANCHOR_TOTAL, power)) }}
                >
                  {CELLS.map((n, i) => (
                    <span key={i}>{n}</span>
                  ))}
                </span>
              </span>
            </span>
          )
        })}
      </div>
      {/* The drums are decoration to a screen reader; this is the number. */}
      <p className="xp-st-sr">
        {NUMBER.format(ANCHOR_TOTAL)} total downloads, growing by about{' '}
        {Math.round(PER_SECOND)} a second.
      </p>

      <div className="xp-st-caption">
        total downloads
        <span className="xp-st-dim">{` · ${WEEKLY_SHORT} weekly downloads`}</span>
      </div>

      <div className="xp-st-row">
        {/* Their own mark, so the chip reads as the shadcn/ui docs before anyone
            reads the words — and the whole thing is the link out. */}
        <a className="xp-st-chip" href={SHADCN_URL} target="_blank" rel="noreferrer">
          <svg className="xp-st-shadcn" viewBox="0 0 256 256" aria-hidden="true">
            <line x1="208" y1="128" x2="128" y2="208" />
            <line x1="192" y1="40" x2="40" y2="192" />
          </svg>
          <span>
            featured in <b>shadcn/ui</b>
          </span>
          <span className="xp-st-arrow" aria-hidden="true">
            ↗
          </span>
        </a>
      </div>
    </section>
  )
}
