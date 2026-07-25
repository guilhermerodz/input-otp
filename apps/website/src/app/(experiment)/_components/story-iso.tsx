'use client'

import * as React from 'react'
import { OTPInput, REGEXP_ONLY_DIGITS } from 'input-otp'
import { cn } from '@/lib/utils'
import {
  ATTRS,
  BEATS,
  CHAR_W,
  DEMO_VALUE,
  FakeCaret,
  Note,
  Arrow,
  SENTENCES,
  SLOT_GAP,
  SLOT_W,
  STAGE_W,
  useStoryScrub,
} from './story-shared'

/* ------------------------------------------------------------------ *
 * Phase tracking
 *
 * The stage rides beside the lecture: its board lines up with whichever
 * sentence is lit, hopping down as the beats turn over. Two things stop
 * that from being a naive `translateY(sentenceCentre)`:
 *
 *  1. The stage is taller than one sentence, so the outer beats ask it to
 *     leave the viewport. Instead of clamping (which strands beats 0-2 on
 *     top of each other), the bounds are softplus'd: dead-on accurate until
 *     the last ~44px, then asymptotic. It never hits a wall — it just runs
 *     out of lean.
 *  2. How much room there *is* depends on the beat, because the margin notes
 *     fly at different altitudes (beat 3's note reaches 238px above the
 *     board; beat 0's only 144px) and the footnote panel only fills up once
 *     the compat props type on. So the limits are measured from the ink each
 *     beat actually draws, and they lead when they tighten but lag when they
 *     relax — the stage is never governed by a limit looser than what is on
 *     screen, and it claims new room only once the old ink has cleared.
 *
 * The stage travels as one rigid piece: the board's margin notes and the
 * footnote panel are its caption, so anything that slid them relative to the
 * board would just print one over the other. The lecture column leans the
 * opposite way by a few dozen px instead, which is where the extra reach at
 * the two ends comes from.
 * ------------------------------------------------------------------ */

/** Breathing room kept between the stage's ink and the sticky viewport. */
const EDGE_PAD = 18
/** Extra half-height the board claims once it tilts into isometric. */
const ISO_BLEED = 46
/** A hop starts just before its sentence lights and lands a third-beat later. */
const HOP_LEAD = -0.08
const HOP_SPAN = 0.42
/** A bound that tightens is fully in force by the time its beat begins... */
const TIGHT_LEAD = -0.62
const TIGHT_SPAN = 0.6
/** ...one that relaxes waits for the previous beat's ink to finish fading. */
const RELAX_LEAD = 0.22
const RELAX_SPAN = 0.45
/** How far the lecture column leans back, and over what span it saturates. */
const DRIFT_MAX = 34
const DRIFT_SPREAD = 420
/** Travel speed (px per beat) that reads as "full tilt" for the scale tuck.
 *  Set just above the longest hop's peak, so short hops tuck less. */
const TUCK_SPEED = 640
/** Width of the cushion in front of each travel bound. */
const SOFT_KNEE = 44

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)
/** softplus — max(x, 0) with the corner rounded off over `r`. */
const softplus = (x: number, r: number) => {
  const t = x / r
  return t > 30 ? x : r * Math.log1p(Math.exp(t))
}
/** A ceiling/floor you glide into: exact until ~3r away, then asymptotic. */
const softMin = (v: number, hi: number, r: number) => hi - softplus(hi - v, r)
const softMax = (v: number, lo: number, r: number) => lo + softplus(v - lo, r)
/** Smootherstep: C² at both ends, so every hop starts and stops at rest. */
const S = (t: number) => {
  t = clamp01(t)
  return t * t * t * (t * (t * 6 - 15) + 10)
}
/** ...and its derivative, which hands us travel speed for free. */
const dS = (t: number) =>
  t <= 0 || t >= 1 ? 0 : 30 * t * t * (1 - t) * (1 - t)

type Align = {
  /** Sentence centres, in the sticky box's coordinates. */
  centers: number[]
  /** Where the board sits when nothing has moved it. */
  rest: number
  /** Per-beat travel bounds (Δ from `rest`), from the ink that beat draws. */
  lo: number[]
  hi: number[]
}

/**
 * Returns the per-frame writer for `--stage-y` / `--text-y` / `--tuck`.
 * Geometry is measured lazily and re-measured whenever the scene reflows.
 */
function useStageAlign(
  stickyRef: React.RefObject<HTMLDivElement>,
  sceneRef: React.RefObject<HTMLDivElement>,
) {
  const align = React.useRef<Align | null>(null)
  const dirty = React.useRef(true)
  const lastP = React.useRef(0)

  const measure = React.useCallback((): Align | null => {
    const sticky = stickyRef.current
    const scene = sceneRef.current
    if (!sticky || !scene) return null
    // Below `lg` the grid stacks and there is nothing to line up with.
    if (!window.matchMedia('(min-width: 1024px)').matches) return null

    const board = scene.querySelector<HTMLElement>('[data-board]')
    const sentences = scene.querySelectorAll<HTMLElement>('[data-sentence]')
    if (!board || sentences.length !== BEATS) return null

    // Read geometry at rest: zero our own transforms first, then measure.
    scene.style.setProperty('--stage-y', '0px')
    scene.style.setProperty('--text-y', '0px')
    scene.style.setProperty('--tuck', '0')

    const base = sticky.getBoundingClientRect().top
    const vh = sticky.clientHeight
    const box = board.getBoundingClientRect()
    const rest = box.top - base + box.height / 2

    const centers = Array.from(sentences, el => {
      const r = el.getBoundingClientRect()
      return r.top - base + r.height / 2
    })

    // Seed every beat with the board itself, inflated for the iso tilt.
    const lo: number[] = []
    const hi: number[] = []
    for (let b = 0; b < BEATS; b++) {
      lo.push(EDGE_PAD - (box.top - base - ISO_BLEED))
      hi.push(vh - EDGE_PAD - (box.bottom - base + ISO_BLEED))
    }

    // Fold in the ink each beat draws.
    scene.querySelectorAll<HTMLElement>('[data-ink]').forEach(el => {
      const beat = Number(el.dataset.ink)
      if (!Number.isInteger(beat) || beat < 0 || beat >= BEATS) return

      let top = Infinity
      let bottom = -Infinity
      // Arrows are absolutely positioned outside their note's border box.
      for (const node of [el, ...Array.from(el.querySelectorAll('svg'))]) {
        const r = node.getBoundingClientRect()
        if (!r.height) continue
        top = Math.min(top, r.top - base)
        bottom = Math.max(bottom, r.bottom - base)
      }
      if (top === Infinity) return

      lo[beat] = Math.max(lo[beat], EDGE_PAD - top)
      hi[beat] = Math.min(hi[beat], vh - EDGE_PAD - bottom)
    })

    // The story only travels downward. A floor that relaxes later on would
    // drag a stage pinned against it back *up*, so keep the floor monotone —
    // costs a little reach on short viewports, buys motion that never
    // reverses.
    for (let b = 1; b < BEATS; b++) lo[b] = Math.max(lo[b], lo[b - 1])

    for (let b = 0; b < BEATS; b++) {
      // A stage too tall for the viewport: stay put rather than fight.
      if (lo[b] > hi[b]) lo[b] = hi[b] = (lo[b] + hi[b]) / 2
    }

    return { centers, rest, lo, hi }
  }, [sceneRef, stickyRef])

  const frame = React.useCallback(
    (p: number) => {
      const scene = sceneRef.current
      if (!scene) return
      lastP.current = p
      if (dirty.current) {
        align.current = measure()
        dirty.current = false
      }

      const a = align.current
      if (!a) {
        scene.style.setProperty('--stage-y', '0px')
        scene.style.setProperty('--text-y', '0px')
        scene.style.setProperty('--tuck', '0')
        return
      }

      // Walk the hops rather than branching on "which beat is current":
      // start at the first sentence and add each hop as its edge is
      // crossed. Continuous, C², and it carries the bounds along with it.
      const u = p * BEATS
      let center = a.centers[0]
      let lo = a.lo[0]
      let hi = a.hi[0]
      let speed = 0
      for (let k = 1; k < BEATS; k++) {
        const t = (u - k - HOP_LEAD) / HOP_SPAN
        const w = S(t)
        const hop = a.centers[k] - a.centers[k - 1]
        center += hop * w
        speed += (hop * dS(t)) / HOP_SPAN

        // Bounds are asymmetric in time: a tightening one is already in
        // force when its beat opens, a relaxing one waits for the outgoing
        // beat's ink to fade. Either way the limit in force is never looser
        // than what is actually drawn.
        const tight = S((u - k - TIGHT_LEAD) / TIGHT_SPAN)
        const relax = S((u - k - RELAX_LEAD) / RELAX_SPAN)
        const dLo = a.lo[k] - a.lo[k - 1]
        const dHi = a.hi[k] - a.hi[k - 1]
        lo += dLo * (dLo > 0 ? tight : relax)
        hi += dHi * (dHi < 0 ? tight : relax)
      }

      // The lecture leans the other way, pulling the live sentence toward
      // the optical centre — worth ~46px of extra reach at the extremes.
      const mid = (a.centers[0] + a.centers[BEATS - 1]) / 2
      const drift = DRIFT_MAX * Math.tanh((mid - center) / DRIFT_SPREAD)

      const want = center + drift - a.rest
      const room = hi - lo
      const r = Math.min(SOFT_KNEE, Math.max(1, room / 4))
      const y = room > 1 ? softMax(softMin(want, hi, r), lo, r) : (lo + hi) / 2

      scene.style.setProperty('--stage-y', `${y.toFixed(2)}px`)
      scene.style.setProperty('--text-y', `${drift.toFixed(2)}px`)
      scene.style.setProperty(
        '--tuck',
        clamp01(Math.abs(speed) / TUCK_SPEED).toFixed(4),
      )
    },
    [measure, sceneRef],
  )

  React.useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    const invalidate = () => {
      dirty.current = true
      frame(lastP.current)
    }
    const ro = new ResizeObserver(invalidate)
    ro.observe(scene)
    window.addEventListener('resize', invalidate)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', invalidate)
    }
  }, [frame, sceneRef])

  return frame
}

/**
 * The isometric stage. The input starts flat on the left, tilts into an
 * isometric exploded stack in the middle of the story — the dashed input
 * plane hovering above the slot layer, characters dropping between them —
 * then collapses, un-tilts and lands flat on the right, live.
 *
 * View and travel are scroll-scrubbed: --tilt (0 flat, 1 isometric),
 * --posx (-1 left, 0 centre, 1 right), --explode (layer separation).
 */
export function IsoStage({ live }: { live: boolean }) {
  const [value, setValue] = React.useState(DEMO_VALUE)

  React.useEffect(() => {
    if (!live) setValue(DEMO_VALUE)
  }, [live])

  return (
    <div data-live={live} className="flex flex-col items-center">
      {/* Travel wrapper: left → centre → right, and down the lecture as
          the beats turn over. It tucks a hair while it's in flight. */}
      <div
        className="relative grid place-items-center"
        style={{
          height: 300,
          transform:
            'translate(calc(var(--posx, 0) * 60px), var(--stage-y, 0px)) scale(calc(1 - var(--tuck, 0) * 0.022))',
          willChange: 'transform',
        }}
      >
        <div
          data-board
          className="relative"
          style={{ width: STAGE_W, height: 64 }}
        >
          {/* The tilting board — everything 3D lives inside. */}
          <div className="xp-iso-board absolute inset-0">
            {/* Slot layer (z = 0): the real component's slots. */}
            <OTPInput
              maxLength={6}
              value={value}
              onChange={setValue}
              pattern={REGEXP_ONLY_DIGITS}
              disabled={!live}
              aria-label="Try input-otp: six-digit demo code"
              containerClassName="relative flex items-center"
              render={({ slots }) => (
                <>
                  {slots.map((slot, idx) => (
                    <div
                      key={idx}
                      style={
                        {
                          '--st': `var(--s${idx})`,
                          '--i': idx,
                        } as React.CSSProperties
                      }
                      className={cn(
                        'anatomy-slot keycap relative flex h-16 items-center justify-center rounded-lg text-xl font-medium tabular-nums text-white',
                        idx > 0 && 'ml-2.5',
                        '!border-white/25',
                        live &&
                          slot.isActive &&
                          '!border-white shadow-[0_0_0_1px_rgba(250,250,250,0.9)]',
                      )}
                    >
                      <div
                        className="anatomy-slot-char"
                        style={{ width: SLOT_W - 2, textAlign: 'center' }}
                      >
                        {slot.char ??
                          (slot.hasFakeCaret ? <FakeCaret /> : null)}
                      </div>
                    </div>
                  ))}
                </>
              )}
            />

            {/* Slot-layer echo of the beat-4 selection. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 rounded-lg bg-white/10"
              style={{
                width: 'calc(var(--selw, 0) * 100%)',
                opacity: 'var(--selo, 0)',
              }}
            />

            {/* The input plane (hovers above the slots when exploded). It
                paints over the slots, so it must not take the clicks that
                belong to the real input underneath — everything in here is
                decoration. */}
            <div
              aria-hidden
              className="xp-iso-plane pointer-events-none absolute -inset-2.5"
            >
              {/* Painted native input, before the paint is stripped. */}
              <div className="anatomy-paint absolute inset-0 rounded-xl border border-white/40 bg-[#1c1c21]" />
              {/* Its dashed footprint. */}
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox={`0 0 ${STAGE_W + 20} 84`}
                preserveAspectRatio="none"
                fill="none"
                style={{ opacity: 'var(--ghost, 0)' }}
              >
                <rect
                  className="anatomy-ants"
                  x="0.75"
                  y="0.75"
                  width={STAGE_W + 18.5}
                  height={82.5}
                  rx="14"
                  stroke="rgba(250, 250, 250, 0.75)"
                  strokeWidth="1.5"
                />
                <rect
                  x="0.75"
                  y="0.75"
                  width={STAGE_W + 18.5}
                  height={82.5}
                  rx="14"
                  fill="rgba(250, 250, 250, 0.04)"
                />
              </svg>
              {/* Plane-level selection sweep (beat 4). */}
              <div
                className="absolute inset-y-2.5 left-2.5 rounded-lg border border-white/30 bg-white/15"
                style={{
                  width: 'calc(var(--selw, 0) * (100% - 20px))',
                  opacity: 'var(--selo, 0)',
                }}
              />
              {/* Native caret, before the value drops. */}
              <span
                className="absolute left-1/2 top-1/2"
                style={{
                  opacity: 'var(--caret, 1)',
                  transform: `translate(-50%, -50%) translateX(${
                    (value.length - 3.5) * CHAR_W + 8
                  }px)`,
                }}
              >
                <span className="block h-6 w-px bg-white motion-safe:animate-caret-blink" />
              </span>
            </div>

            {/* The value: rides the plane, then drops into the slots. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {Array.from({ length: 6 }).map((_, i) => {
                const home = (i - 2.5) * CHAR_W
                const slotCenter = i * (SLOT_W + SLOT_GAP) + SLOT_W / 2
                const dx = slotCenter - (STAGE_W / 2 + home)
                return (
                  <span
                    key={i}
                    className="xp-iso-flyer text-xl font-medium tabular-nums text-white"
                    style={
                      {
                        '--home': `${home}px`,
                        '--dx': `${dx}px`,
                        '--ft': `var(--f${i})`,
                      } as React.CSSProperties
                    }
                  >
                    {value[i] ?? ''}
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        {/* Hand-written margin notes, one per beat. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <Note
            seg="--seg0"
            first
            ink={0}
            className="top-[11px] left-[-20px] w-max max-w-[300px] -rotate-2"
          >
            one real HTML input — paint and all
            <Arrow
              seg="--seg0"
              className="left-[130px] top-[calc(100%+3px)] h-[24px] w-[48px]"
              d="M44 2 C 30 4, 16 10, 8 20"
              head="M15 17.5 L8 20 M7.5 13 L8 20"
            />
          </Note>

          <Note
            seg="--seg1"
            ink={1}
            className="top-[41px] right-[60px] w-max max-w-[320px] rotate-[1.5deg]"
          >
            paint gone — tilt it, it never left
            <Arrow
              seg="--seg1"
              className="right-[110px] top-[calc(100%+3px)] h-[24px] w-[48px]"
              d="M4 2 C 18 4, 32 10, 40 20"
              head="M33 17.5 L40 20 M40.5 13 L40 20"
            />
          </Note>

          <Note
            seg="--seg2"
            ink={2}
            className="bottom-[2px] left-1/2 w-max max-w-[320px] -translate-x-1/2 -rotate-1 text-center"
          >
            the slots live on a layer of their own
            <Arrow
              seg="--seg2"
              viewBox="0 0 20 30"
              className="bottom-[calc(100%+2px)] left-1/2 h-[30px] w-[20px] -translate-x-1/2 -scale-y-100"
              d="M10 2 C 8 10, 10 18, 10 26"
              head="M5.5 21.5 L10 26 M14.5 21.5 L10 26"
            />
          </Note>

          <Note
            seg="--seg3"
            ink={3}
            className="top-[-85px] left-1/2 w-max max-w-[320px] -translate-x-1/2 -rotate-1 text-center"
          >
            the hidden value drops into the slots
            <Arrow
              seg="--seg3"
              viewBox="0 0 20 88"
              className="left-1/2 top-[calc(100%+2px)] h-[88px] w-[20px] -translate-x-1/2"
              d="M10 2 C 5 30, 13 58, 10 84"
              head="M5.5 79 L10 84 M14.5 79 L10 84"
            />
          </Note>

          <Note
            seg="--seg4"
            ink={4}
            className="top-[-80px] right-[-5px] w-max max-w-[320px] rotate-1"
          >
            one selection — every layer follows
            <Arrow
              seg="--seg4"
              viewBox="0 0 95 65"
              className="left-[40px] top-[calc(100%+3px)] h-[65px] w-[95px]"
              d="M10 2 C 4 32, 28 56, 82 58"
              head="M73 53.5 L82 58 M74.5 63 L82 58"
            />
          </Note>

          <Note
            seg="--seg6"
            ink={6}
            className="top-[27px] left-1/2 w-max max-w-[300px] -translate-x-1/2 rotate-[-1.5deg] text-center"
          >
            flat again — and live. type!
            <Arrow
              seg="--seg6"
              viewBox="0 0 20 32"
              className="left-1/2 top-[calc(100%-3px)] h-[32px] w-[20px] -translate-x-1/2"
              d="M10 2 C 8 12, 10 20, 10 28"
              head="M5.5 23.5 L10 28 M14.5 23.5 L10 28"
            />
          </Note>
        </div>
      </div>

      {/* Compat props typing on, then swapping for the live readout. */}
      <div
        className="relative mt-2 h-40 font-mono text-xs leading-[1.9]"
        style={{
          width: 326,
          transform:
            'translate(calc(var(--posx, 0) * 60px), var(--stage-y, 0px))',
          willChange: 'transform',
        }}
      >
        <div
          aria-hidden
          data-ink="5"
          className="absolute inset-x-0 top-[6px]"
          style={{ opacity: 'calc(1 - var(--aout, 0))' }}
        >
          {ATTRS.map((attr, j) => (
            <div
              key={attr.code}
              className="anatomy-attr whitespace-nowrap"
              style={{ '--at': `var(--a${j})` } as React.CSSProperties}
            >
              <span className="text-white">{attr.code}</span>{' '}
              <span className="hidden text-white/50 sm:inline">
                · {attr.note}
              </span>
            </div>
          ))}
        </div>
        <Note
          seg="--seg5"
          ink={5}
          className="left-[-14px] top-[-70px] -rotate-1"
        >
          countless hours of DX, so you never think about this
        </Note>
        <div
          aria-hidden
          data-ink="6"
          className="absolute inset-x-0 top-[-110px]"
          style={{ opacity: 'var(--rin, 0)' }}
        >
          <div className="text-white/50">{'// the hidden <input>, live'}</div>
          <div className="grid w-fit grid-cols-[auto_auto] gap-x-8">
            <span className="text-white/50">value</span>
            <span className="text-white">
              &quot;{value}
              <span className="text-white/40">
                {'·'.repeat(6 - value.length)}
              </span>
              &quot;
            </span>
            <span className="text-white/50">focused</span>
            <span className="text-emerald-400">{live ? 'ready' : '—'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * The final "How I built it": the margin-lecture text column from
 * variant 1, performed by the isometric stage.
 */
export function StoryIso() {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const sceneRef = React.useRef<HTMLDivElement>(null)
  const stickyRef = React.useRef<HTMLDivElement>(null)
  const frame = useStageAlign(stickyRef, sceneRef)
  const step = useStoryScrub(trackRef, sceneRef, frame)

  return (
    <div ref={trackRef} className="relative h-[640vh]">
      <div
        ref={stickyRef}
        className="sticky top-0 flex h-[100svh] items-center overflow-hidden"
      >
        <div
          ref={sceneRef}
          className="mx-auto grid w-full max-w-5xl items-center gap-y-10 px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-16"
        >
          <div
            className="flex gap-6"
            style={{ transform: 'translateY(var(--text-y, 0px))' }}
          >
            <div
              aria-hidden
              className="relative w-[3px] self-stretch overflow-hidden rounded-full bg-white/10"
            >
              <div
                className="absolute inset-0 origin-top rounded-full bg-white/60"
                style={{ transform: 'scaleY(var(--prog, 0))' }}
              />
            </div>
            <div className="flex flex-col gap-5 lg:gap-7">
              {SENTENCES.map((sentence, i) => (
                <p
                  key={i}
                  data-sentence
                  className="m-0 text-balance text-xl font-semibold leading-snug tracking-tight text-white md:text-[1.7rem] md:leading-snug"
                  style={{ opacity: `var(--sent${i}, ${i === 0 ? 1 : 0.08})` }}
                >
                  {sentence}
                </p>
              ))}
            </div>
          </div>

          <div className="min-w-[420px] max-lg:min-w-0">
            <IsoStage live={step === BEATS - 1} />
          </div>
        </div>
      </div>
    </div>
  )
}
