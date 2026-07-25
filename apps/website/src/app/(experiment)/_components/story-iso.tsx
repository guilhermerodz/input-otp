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
 * board would just print one over the other.
 *
 * The lecture is a masked window. The list inside it translates so the live
 * sentence sits at the same proportional height in the window that it
 * occupies in the list — top of the list reads at the top of the window, end
 * at the bottom. When the whole lecture fits, that offset is identically zero
 * and nothing moves, which is the tall-desktop composition: seven sentences
 * at once, the stage gliding between them. Everything below that is the same
 * formula with a non-zero overflow, so there is no second layout to keep in
 * step — only fewer sentences on screen at a time.
 * ------------------------------------------------------------------ */

/** Breathing room kept between the stage's ink and the sticky viewport. */
const EDGE_PAD = 18
/** Room left above and below the lecture window inside the sticky viewport. */
const LECT_PAD = 12
/** Slack the window keeps beyond the list so the lean has somewhere to go. */
const LEAN_ROOM = 34
/** How far the lecture leans when it fits, and over what span that saturates. */
const DRIFT_MAX = 34
const DRIFT_SPREAD = 420
/** How deep the window's top/bottom fades reach once content hides behind. */
const FADE = 64
/** Both stops collapse to the edge when nothing is hidden, so a lecture that
 *  fits its window is masked by an entirely opaque gradient. */
const LECT_MASK =
  'linear-gradient(to bottom, transparent 0, #000 var(--fade-t, 0px), #000 calc(100% - var(--fade-b, 0px)), transparent 100%)'
/** Extra half-height the board claims once it tilts into isometric. */
const ISO_BLEED = 46
/** Widest left-to-right swing the stage takes across the story. */
const POSX_AMP = 60
/** Most of the fold the stage may claim when it sits above the lecture. */
const STAGE_SHARE = 0.52
/** A hop starts just before its sentence lights and lands a third-beat later. */
const HOP_LEAD = -0.08
const HOP_SPAN = 0.42
/** A bound that tightens is fully in force by the time its beat begins... */
const TIGHT_LEAD = -0.62
const TIGHT_SPAN = 0.6
/** ...one that relaxes waits for the previous beat's ink to finish fading. */
const RELAX_LEAD = 0.22
const RELAX_SPAN = 0.45
/** Travel speed (px per beat) that reads as "full tilt" for the scale tuck.
 *  Set just above the longest hop's peak, so short hops tuck less. */
const TUCK_SPEED = 640
/** Width of the cushion in front of each travel bound. */
const SOFT_KNEE = 44

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)
const clamp = (v: number, lo: number, hi: number) =>
  lo > hi ? lo : v < lo ? lo : v > hi ? hi : v
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
  /** Two-column composition — only then does the stage track the lecture. */
  twoCol: boolean
  /** Sentence centres, measured inside the list (which is what translates). */
  centers: number[]
  /** Half-heights, so a nudge can tell when one is about to be veiled. */
  halves: number[]
  /** The list's resting top, in the sticky box's coordinates. */
  listTop: number
  /** How much taller the list is than its window; 0 when it all fits. */
  overflow: number
  /** Spare window height when it does fit — the list is top-aligned, so this
   *  is what centres it and gives the lean somewhere to go. */
  slack: number
  /** Fade depth that still leaves the longest sentence fully legible. */
  fade: number
  /** The window, and the list that scrolls inside it. */
  winH: number
  listH: number
  /** Where the board sits when nothing has moved it. */
  rest: number
  /** Per-beat travel bounds (Δ from `rest`), from the ink that beat draws. */
  lo: number[]
  hi: number[]
  /** The board alone must stay on screen even when the ink cannot. */
  hardLo: number
  hardHi: number
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

    const board = scene.querySelector<HTMLElement>('[data-board]')
    const stage = scene.querySelector<HTMLElement>('[data-stage-fit]')
    const win = scene.querySelector<HTMLElement>('[data-lecture]')
    const list = scene.querySelector<HTMLElement>('[data-list]')
    const sentences = scene.querySelectorAll<HTMLElement>('[data-sentence]')
    if (!board || !stage || !win || !list || sentences.length !== BEATS)
      return null

    // Read geometry at rest: zero our own transforms first, then measure.
    scene.style.setProperty('--stage-y', '0px')
    scene.style.setProperty('--text-y', '0px')
    scene.style.setProperty('--tuck', '0')
    scene.style.setProperty('--stage-fit', '1')
    scene.style.setProperty('--stage-box', 'auto')

    const base = sticky.getBoundingClientRect().top
    const vh = sticky.clientHeight
    const twoCol = getComputedStyle(scene).display === 'grid'

    // Narrow screens shrink the stage to fit rather than letting the sticky
    // box crop its edges. Scaling is paint-only, so the box it leaves behind
    // has to be told the new height or the lecture keeps the old gap.
    const pad = getComputedStyle(scene)
    const availW =
      scene.clientWidth -
      parseFloat(pad.paddingLeft) -
      parseFloat(pad.paddingRight)
    const natural = stage.getBoundingClientRect().height
    // Width is the usual constraint, but a landscape phone runs out of height
    // first — the stage never takes more than its share of the fold, or there
    // is no lecture left to read.
    const fit = twoCol
      ? 1
      : Math.min(1, availW / STAGE_W, (vh * STAGE_SHARE) / natural)
    scene.style.setProperty('--stage-fit', fit.toFixed(4))
    scene.style.setProperty(
      '--stage-box',
      fit < 1 ? `${Math.round(natural * fit)}px` : 'auto',
    )
    // The left-to-right travel is measured in the column's spare width, not
    // a fixed 60px — on a phone that would swing the board off both edges.
    // The scale multiplies it too, hence the divide.
    const amp = twoCol
      ? POSX_AMP
      : Math.max(0, Math.min(POSX_AMP, (availW / fit - STAGE_W) / 2))
    scene.style.setProperty('--posx-amp', `${amp.toFixed(1)}px`)

    // The list's own box is its natural height whatever the window does to
    // it, so it can be read before the window is sized.
    const listBox = list.getBoundingClientRect()
    // Stacked, the window gets what the stage leaves; side by side it gets
    // the viewport. Either way it never asks for more than the list plus the
    // slack the lean rides in.
    const gap = parseFloat(getComputedStyle(scene).rowGap) || 0
    const room = twoCol
      ? vh - LECT_PAD * 2
      : vh - natural * fit - gap - LECT_PAD
    const lectMax = Math.max(110, room)
    scene.style.setProperty(
      '--lect-h',
      `${Math.min(lectMax, listBox.height + LEAN_ROOM * 2)}px`,
    )
    const winH = win.getBoundingClientRect().height
    const overflow = Math.max(0, listBox.height - winH)
    const slack = Math.max(0, winH - listBox.height)
    // The rail measures the text, not the slack the lean rides in.
    scene.style.setProperty(
      '--rail-h',
      `${Math.round(Math.min(listBox.height, winH))}px`,
    )
    const listTop = list.getBoundingClientRect().top - base
    // Sentence centres are list-relative: the list is the thing that moves.
    let tallest = 0
    const halves: number[] = []
    const centers = Array.from(sentences, el => {
      const r = el.getBoundingClientRect()
      tallest = Math.max(tallest, r.height)
      halves.push(r.height / 2)
      return r.top - listBox.top + r.height / 2
    })
    // A fade deep enough to veil the live sentence is worse than no fade at
    // all, so on a short window it gives way to the text.
    const fade = Math.max(0, Math.min(FADE, (winH - tallest) / 2 - 8))

    const box = board.getBoundingClientRect()
    const rest = box.top - base + box.height / 2

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

    // The ink bounds can invert on a short viewport — there is simply no
    // placement that keeps every note on screen. That is survivable (notes
    // crop), but the board going missing is not, so it gets its own bound
    // that is always obeyed.
    let hardLo = EDGE_PAD - (box.top - base - ISO_BLEED)
    let hardHi = vh - EDGE_PAD - (box.bottom - base + ISO_BLEED)
    if (hardLo > hardHi) hardLo = hardHi = (hardLo + hardHi) / 2

    return {
      twoCol,
      centers,
      halves,
      listTop,
      overflow,
      slack,
      fade,
      winH,
      listH: listBox.height,
      rest,
      lo,
      hi,
      hardLo,
      hardHi,
    }
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
      let half = a.halves[0]
      let lo = a.lo[0]
      let hi = a.hi[0]
      let speed = 0
      for (let k = 1; k < BEATS; k++) {
        const t = (u - k - HOP_LEAD) / HOP_SPAN
        const w = S(t)
        const hop = a.centers[k] - a.centers[k - 1]
        center += hop * w
        half += (a.halves[k] - a.halves[k - 1]) * w
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

      // Where the live sentence sits along the lecture, 0..1. The list is
      // scrolled by that same fraction of its overflow, so the sentence lands
      // at the matching height inside the window: first at the top, last at
      // the bottom, everything else proportionally between. With no overflow
      // this is a constant zero and the lecture simply stands still.
      const span = a.centers[BEATS - 1] - a.centers[0]
      const f = span > 0 ? clamp01((center - a.centers[0]) / span) : 0
      // When it all fits there is nothing to scroll, so the lecture leans
      // instead — a few dozen px toward the live sentence, which is worth
      // real reach to the stage at the first and last beats. Once the list
      // does overflow, the scroll is already doing that job.
      const mid = (a.centers[0] + a.centers[BEATS - 1]) / 2
      const lean =
        a.overflow > 0
          ? 0
          : DRIFT_MAX * Math.tanh((mid - center) / DRIFT_SPREAD)
      // The list is top-aligned so that f=0 puts its first line at the top of
      // the window and f=1 puts its last at the bottom; the slack term is
      // what re-centres it on the viewports where it fits outright.
      // Two regimes, and the boundary is exactly "does the lecture fit".
      // It fits: hold still, centred, plus the lean. That is the tall-desktop
      // composition — seven sentences at rest — and it must not drift.
      // It doesn't: scroll so the live sentence lands proportionally inside
      // the *legible* band, which is the window less whatever the fades are
      // covering. Mapping across the whole window instead would park the
      // first and last sentences under their own fade.
      let textY: number
      if (a.overflow > 0) {
        // The clean map: first sentence flush with the top of the window,
        // last flush with the bottom, everything proportional between. The
        // ends need no correction because nothing is hidden past them yet.
        textY = -a.overflow * f
        // Mid-story though, a fade is live at both edges and can eat the
        // sentence being read. Nudge — the least that clears it — rather than
        // distorting the map everywhere to avoid a case that is usually moot.
        for (let i = 0; i < 2; i++) {
          const ft = Math.min(a.fade, Math.max(0, -textY))
          const fb = Math.min(a.fade, Math.max(0, a.listH + textY - a.winH))
          const top = center - half + textY
          const bot = center + half + textY
          if (top < ft) textY += ft - top
          else if (bot > a.winH - fb) textY -= bot - (a.winH - fb)
          else break
        }
      } else {
        textY = a.slack / 2 + lean
      }

      scene.style.setProperty('--text-y', `${textY.toFixed(2)}px`)
      // Fades only reach as deep as there is hidden text behind them, so a
      // lecture that fits is never veiled at its edges.
      // Each fade reaches only as deep as there is text hidden behind it, so
      // a lecture that fits is never veiled at its edges.
      const above = Math.max(0, -textY)
      const below = Math.max(0, a.listH + textY - a.winH)
      scene.style.setProperty(
        '--fade-t',
        `${Math.min(a.fade, above).toFixed(1)}px`,
      )
      scene.style.setProperty(
        '--fade-b',
        `${Math.min(a.fade, below).toFixed(1)}px`,
      )

      if (!a.twoCol) {
        // Stacked: the stage is parked above the lecture, which scrolls
        // beneath it. Nothing to track.
        scene.style.setProperty('--stage-y', '0px')
        scene.style.setProperty('--tuck', '0')
        return
      }

      const want = a.listTop + center + textY - a.rest
      const room = hi - lo
      const r = Math.min(SOFT_KNEE, Math.max(1, room / 4))
      // Fit into the ink bounds where they leave room, then hard-cap on the
      // board so the stage can never leave the viewport whatever the notes want.
      const soft = room > 1 ? softMax(softMin(want, hi, r), lo, r) : want
      const y = Math.min(Math.max(soft, a.hardLo), a.hardHi)

      scene.style.setProperty('--stage-y', `${y.toFixed(2)}px`)
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
          height: 'var(--stage-track, 300px)',
          transform:
            'translate(calc(var(--posx, 0) * var(--posx-amp, 60px)), var(--stage-y, 0px)) scale(calc(1 - var(--tuck, 0) * 0.022))',
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
              style={{
                transform:
                  'translateZ(calc(var(--explode, 0) * var(--explode-z, 88px)))',
              }}
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
                        // Matches .xp-iso-flyer, but with the plane's altitude
                        // read from the same var so the characters keep
                        // landing on it when the explode is scaled down.
                        transform:
                          'translate(-50%, -50%) translateX(calc(var(--home) + var(--ft, 0) * var(--dx))) translateZ(calc(var(--explode, 0) * (1 - var(--ft, 0)) * var(--explode-z, 88px)))',
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

        {/* Hand-written margin notes, one per beat. They need margins to be
            written in — stacked layouts have none, and the sentences are
            already saying the same thing right below. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 max-lg:hidden"
        >
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
        className="relative mt-2 h-24 font-mono text-xs leading-[1.9] lg:h-40"
        style={{
          width: 326,
          transform:
            'translate(calc(var(--posx, 0) * var(--posx-amp, 60px)), var(--stage-y, 0px))',
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
          className="left-[-14px] top-[-70px] -rotate-1 max-lg:hidden"
        >
          countless hours of DX, so you never think about this
        </Note>
        {/* The readout hangs above the panel on wide layouts. With the short
            stacked track there is no room up there, so it takes the slot the
            props are vacating — they never show at the same time. */}
        <div
          aria-hidden
          data-ink="6"
          className="absolute inset-x-0 top-[6px] lg:top-[-110px]"
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

  /**
   * Scroll the page to the beat a sentence belongs to. The story has no
   * anchors to jump to — it is one tall track scrubbed by scroll — so the
   * beat is turned back into the scroll offset that produces it.
   */
  const jumpTo = React.useCallback((i: number) => {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const total = rect.height - window.innerHeight
    if (total <= 0) return
    // Land mid-beat: the sentence is fully lit and the stage has finished
    // hopping to it. The last beat is the exception — its input only goes
    // live, flat and typeable near the end — so that one lands late.
    const p = (i + (i === BEATS - 1 ? 0.92 : 0.5)) / BEATS
    // 'instant', not 'auto': the page sets scroll-behavior: smooth on <html>,
    // which 'auto' would defer to — the one case that must not glide.
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    window.scrollTo({
      top: window.scrollY + rect.top + p * total,
      behavior: reduced ? 'instant' : 'smooth',
    })
  }, [])

  return (
    <div ref={trackRef} className="relative h-[640vh]">
      <div ref={stickyRef} className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          ref={sceneRef}
          className="mx-auto flex h-full w-full max-w-5xl flex-col justify-center gap-7 px-4 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-x-16 lg:gap-y-0 [--stage-track:228px] [--explode-z:40px] lg:[--stage-track:300px] lg:[--explode-z:88px]"
        >
          {/* The stage leads on a stacked layout — you meet the input before
              you are told about it — and returns to the right-hand column
              once there are two. */}
          <div
            className="order-1 shrink-0 lg:order-2 lg:min-w-[420px]"
            style={{ height: 'var(--stage-box, auto)' }}
          >
            <div
              data-stage-fit
              style={{
                transform: 'scale(var(--stage-fit, 1))',
                transformOrigin: 'top center',
              }}
            >
              <IsoStage live={step === BEATS - 1} />
            </div>
          </div>

          <div className="order-2 flex min-h-0 gap-4 lg:order-1 lg:gap-6">
            <div
              aria-hidden
              className="relative w-[3px] shrink-0 self-center overflow-hidden rounded-full bg-white/10"
              style={{ height: 'var(--rail-h, 100%)' }}
            >
              <div
                className="absolute inset-0 origin-top rounded-full bg-white/60"
                style={{ transform: 'scaleY(var(--prog, 0))' }}
              />
            </div>
            <div
              data-lecture
              className="flex min-h-0 flex-1 items-start overflow-hidden"
              // Tabbing to a sentence that is currently masked makes the
              // browser try to reveal it by scrolling this box. Nothing here
              // is meant to scroll — the list is placed by --text-y — so any
              // such scroll is undone before it can slip the mask.
              onScroll={e => {
                e.currentTarget.scrollTop = 0
                e.currentTarget.scrollLeft = 0
              }}
              style={{
                height: 'var(--lect-h, auto)',
                maskImage: LECT_MASK,
                WebkitMaskImage: LECT_MASK,
              }}
            >
              <div
                data-list
                className="flex w-full flex-col gap-5 lg:gap-7"
                style={{ transform: 'translateY(var(--text-y, 0px))' }}
              >
                {SENTENCES.map((sentence, i) => (
                  <button
                    key={i}
                    type="button"
                    data-sentence
                    onClick={() => jumpTo(i)}
                    // Keyboard focus lands on beats that may be dimmed and
                    // off-window; bring the story to the one being read.
                    onFocus={e => {
                      if (e.currentTarget.matches(':focus-visible')) jumpTo(i)
                    }}
                    className="xp-beat m-0 border-0 bg-transparent p-0 text-balance text-lg font-semibold leading-snug tracking-tight text-white sm:text-xl md:text-[1.7rem] md:leading-snug"
                    style={
                      {
                        '--o': `var(--sent${i}, ${i === 0 ? 1 : 0.08})`,
                      } as React.CSSProperties
                    }
                  >
                    {sentence}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
