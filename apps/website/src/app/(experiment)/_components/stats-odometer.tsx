'use client'

/* "Trusted at scale". 700M is a number nobody feels, so the section does not
   print it — it prints the count, all nine digits, moving at the speed the
   package is actually installed. Nine drums geared to each other, the ones drum
   turning five and a half times a second and smeared out because that is what a
   wheel that fast looks like. Nobody reads the last two digits. Nobody is meant
   to: the blur is the statistic. */

import { useEffect, useRef, useState } from 'react'

import type { DownloadStats } from '../_data/npm-downloads'
import { canReplayIntro, replayIntro } from './preloader'

/* The two figures behind everything below — the running total as of a known
   instant, and the last seven days — arrive from npm-stat on the server and are
   refreshed every 12 hours (see _data/npm-downloads.ts). npm reports daily, not
   per install, so the digits are a model of a real rate rather than a feed. */

/* Fixed locale: this renders on the server too, and a count that groups
   differently on the two passes is a hydration mismatch. */
const NUMBER = new Intl.NumberFormat('en-US')

const SHADCN_URL = 'https://ui.shadcn.com/docs/components/input-otp'

/* How long the first paint's figure takes to catch up to the live one. */
const SPIN_MS = 1400

/* `still` marks the one frame reduced motion gets: nothing will move after it,
   so anything that would normally be caught mid-motion has to be drawn at rest
   instead. */
type Frame = { total: number; still?: boolean }

/* A rAF loop writing to the DOM by hand. At 54 downloads a second the number
   changes every single frame, and re-rendering React sixty times a second to
   move one digit is not a trade worth making.

   The server has no clock it can share, so the markup ships the anchor total
   and the loop eases from there up to the live figure over the first moment on
   screen — the catch-up is the reveal, not a glitch to hide. */
function useDownloadClock(
  anchorAt: number,
  anchorTotal: number,
  perSecond: number,
  onFrame: (frame: Frame) => void,
) {
  const hostRef = useRef<HTMLElement>(null)
  const latest = useRef(onFrame)
  latest.current = onFrame

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const live = anchorTotal + ((Date.now() - anchorAt) / 1000) * perSecond

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
      const since = (t / 1000) * perSecond
      const spin = t < SPIN_MS ? 1 - (1 - t / SPIN_MS) ** 3 : 1
      latest.current({
        total: anchorTotal + (live - anchorTotal) * spin + since,
      })
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
  }, [anchorAt, anchorTotal, perSecond])

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

function drumAt(total: number, power: number, rate: number, still = false) {
  const perSecond = rate / 10 ** power
  const x = total / 10 ** power
  if (still) return Math.floor(x) % 10
  if (perSecond > 2.5) return x % 10
  const digit = Math.floor(x) % 10
  const frac = x - Math.floor(x)
  const turn = Math.min((TURN_MS / 1000) * perSecond, 1)
  return digit + (frac > 1 - turn ? (frac - (1 - turn)) / turn : 0)
}

function drumSpin(power: number, rate: number) {
  const speed = rate / 10 ** power
  if (speed > 20) return 'fast'
  if (speed > 2.5) return 'soft'
  return 'still'
}

function shift(position: number) {
  return `translate3d(0, calc(var(--st-cell) * ${-position}), 0)`
}

export function StatsOdometer({ downloads }: { downloads: DownloadStats }) {
  const { anchorAt, total: anchorTotal, weekly } = downloads

  const perSecond = weekly / (7 * 24 * 60 * 60)

  /* Rounded off the live figure rather than written out, so a refreshed week
     moves the headline with it. */
  const weeklyShort = `${Math.round(weekly / 1e6)}M`

  /* One drum per digit of the anchor. Grows on its own the day the total
     crosses a billion. */
  const digits = String(Math.floor(anchorTotal)).length

  const drums = useRef<(HTMLSpanElement | null)[]>([])

  /* The number is the way back into the intro — the only one. Rendered
     disabled and enabled on mount rather than swapped in: the markup is the
     same on both passes, and a visitor on reduced motion (or with no JS) is
     left with a number that plainly does not offer anything. */
  const [replayable, setReplayable] = useState(false)
  useEffect(() => setReplayable(canReplayIntro()), [])

  const hostRef = useDownloadClock(anchorAt, anchorTotal, perSecond, frame => {
    for (let j = 0; j < digits; j++) {
      const drum = drums.current[j]
      if (drum)
        drum.style.transform = shift(
          drumAt(frame.total, digits - 1 - j, perSecond, frame.still),
        )
    }
  })

  return (
    <section className="xp-st-section" ref={hostRef} data-rv-group>
      <div className="xp-st-eyebrow xp-mono" data-rv="eyebrow">
        TRUSTED AT SCALE<span style={{ color: '#3f3f46' }}>_</span>
      </div>

      <button
        type="button"
        className="xp-st-odo-btn"
        onClick={replayIntro}
        disabled={!replayable}
        aria-label="Replay the downloads intro"
        title="Replay the intro"
      >
        <div className="xp-st-odo xp-mono" aria-hidden="true" data-rv="title">
          {Array.from({ length: digits }, (_, j) => {
            const power = digits - 1 - j
            return (
              <span className="xp-st-odo-group" key={power}>
                {j > 0 && power % 3 === 2 && (
                  <span className="xp-st-odo-sep">,</span>
                )}
                <span
                  className="xp-st-odo-col"
                  data-spin={drumSpin(power, perSecond)}
                >
                  <span
                    className="xp-st-odo-drum"
                    ref={el => {
                      drums.current[j] = el
                    }}
                    style={{
                      transform: shift(drumAt(anchorTotal, power, perSecond)),
                    }}
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
      </button>
      {/* The drums are decoration to a screen reader; this is the number. */}
      <p className="xp-st-sr">
        {NUMBER.format(anchorTotal)} total downloads, growing by about{' '}
        {Math.round(perSecond)} a second.
      </p>

      <div className="xp-st-caption" data-rv="lede">
        total downloads
        <span className="xp-st-dim">{` · ${weeklyShort} weekly`}</span>
      </div>

      <div className="xp-st-row" data-rv="chrome">
        {/* Their own mark, so the chip reads as the shadcn/ui docs before anyone
            reads the words — and the whole thing is the link out. */}
        <a
          className="xp-st-chip"
          href={SHADCN_URL}
          target="_blank"
          rel="noreferrer"
        >
          <svg
            className="xp-st-shadcn"
            viewBox="0 0 256 256"
            aria-hidden="true"
          >
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
