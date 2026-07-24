'use client'

import * as React from 'react'
import { OTPInput, REGEXP_ONLY_DIGITS } from 'input-otp'
import { fontHand } from '@/lib/fonts'
import { cn } from '@/lib/utils'

/**
 * Shared engine for the "How I built it" story variants: seven beats, no
 * numbers — a big text narrates while the stage acts it out. All
 * interpolation is CSS custom properties written once per scroll frame.
 */

export const BEATS = 7

export const SENTENCES: React.ReactNode[] = [
  <>
    I started with one real{' '}
    <code className="rounded bg-white/10 px-1.5 font-mono text-[0.82em]">
      &lt;input&gt;
    </code>{' '}
    — not six divs faking it.
  </>,
  <>
    Then I stripped its paint. It&apos;s still there — the dashed line is its
    footprint.
  </>,
  <>I drew my own slots. Six plain divs, pure presentation.</>,
  <>
    The value is mirrored — each slot shows one character of the hidden text.
  </>,
  <>
    Caret, selection, copy-paste — still native. The slots just follow along.
  </>,
  <>
    Then I absorbed the quirks: SMS autofill, mobile keyboards,
    password-manager badges, WebKit&apos;s opinions.
  </>,
  <>Boom — input-otp. Go ahead, type in it.</>,
]

export const SLOT_W = 46
export const SLOT_GAP = 10
export const CHAR_W = 12
export const STAGE_W = 6 * SLOT_W + 5 * SLOT_GAP
export const DEMO_VALUE = '141952'

function seg(p: number, a: number, b: number) {
  return Math.min(1, Math.max(0, (p - a) / (b - a)))
}
function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3)
}
function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Writes every scrub var onto the scene element and returns the current
 * beat. Sentence vars: --sent{i} (text brightness) and --hl{i} (highlight
 * sweep 0..1 while the sentence is the current one).
 */
export function useStoryScrub(
  trackRef: React.RefObject<HTMLDivElement>,
  sceneRef: React.RefObject<HTMLDivElement>,
) {
  const [step, setStep] = React.useState(0)

  React.useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const track = trackRef.current
      const scene = sceneRef.current
      if (!track || !scene) return
      const rect = track.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0

      const s = scene.style
      s.setProperty('--paint', (1 - seg(p, 0.155, 0.25)).toFixed(4))
      s.setProperty(
        '--ghost',
        (seg(p, 0.155, 0.25) * (1 - seg(p, 0.875, 0.95))).toFixed(4),
      )
      s.setProperty('--caret', (1 - seg(p, 0.44, 0.49)).toFixed(4))
      s.setProperty('--boom', seg(p, 0.865, 0.94).toFixed(4))
      s.setProperty('--aout', seg(p, 0.845, 0.885).toFixed(4))
      s.setProperty('--rin', seg(p, 0.9, 0.955).toFixed(4))

      for (let i = 0; i < 6; i++) {
        const rise = seg(p, 0.3 + i * 0.012, 0.38 + i * 0.012)
        const fly = seg(p, 0.44 + i * 0.015, 0.53 + i * 0.015)
        s.setProperty(`--s${i}`, easeOut(rise).toFixed(4))
        s.setProperty(`--f${i}`, easeInOut(fly).toFixed(4))
      }
      for (let j = 0; j < 4; j++) {
        // The "countless hours" note leads beat 5; the props follow it.
        const at = seg(p, 0.762 + j * 0.022, 0.802 + j * 0.022)
        s.setProperty(`--a${j}`, easeOut(at).toFixed(4))
      }
      s.setProperty('--prog', p.toFixed(4))

      // Isometric choreography: plain->iso tilt, left->center->right
      // travel, and exploded layer separation that collapses again as the
      // quirks are absorbed.
      const tilt =
        easeInOut(seg(p, 0.16, 0.245)) * (1 - easeInOut(seg(p, 0.845, 0.92)))
      const posx =
        -1 + easeInOut(seg(p, 0.13, 0.255)) + easeInOut(seg(p, 0.845, 0.93))
      const explode =
        easeInOut(seg(p, 0.29, 0.36)) * (1 - easeInOut(seg(p, 0.72, 0.8)))
      s.setProperty('--tilt', tilt.toFixed(4))
      s.setProperty('--posx', posx.toFixed(4))
      s.setProperty('--explode', explode.toFixed(4))

      // Beat 4: a selection sweeps across the slots and recedes.
      s.setProperty('--selw', easeInOut(seg(p, 0.585, 0.665)).toFixed(4))
      s.setProperty(
        '--selo',
        (seg(p, 0.573, 0.6) * (1 - seg(p, 0.696, 0.72))).toFixed(4),
      )

      // Sentence reveal: future faint, current bright, past dimmed.
      for (let i = 0; i < BEATS; i++) {
        const edge = i / BEATS
        const nextEdge = (i + 1) / BEATS
        const enter =
          i === 0 ? 1 : easeOut(seg(p, edge - 0.012, edge + 0.045))
        const passed =
          i === BEATS - 1 ? 0 : easeOut(seg(p, nextEdge + 0.005, nextEdge + 0.05))
        const bright = Math.max(0.08, 0.08 + 0.92 * enter - 0.6 * passed)
        s.setProperty(`--seg${i}`, seg(p, edge, nextEdge).toFixed(4))
        s.setProperty(`--sent${i}`, bright.toFixed(4))
        s.setProperty(`--hl${i}`, (enter * (1 - passed)).toFixed(4))
      }

      setStep(Math.min(BEATS - 1, Math.floor(p * BEATS)))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [trackRef, sceneRef])

  return step
}

export const ATTRS = [
  { code: 'autoComplete="one-time-code"', note: 'one-tap SMS codes' },
  { code: 'inputMode="numeric"', note: 'the right mobile keyboard' },
  { code: 'clipPath="inset(0 40px 0 0)"', note: 'dodges password-manager badges' },
  { code: 'WebkitTextFillColor="transparent"', note: 'WebKit has opinions' },
] as const

export function FakeCaret() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center motion-safe:animate-caret-blink">
      <div className="h-6 w-px bg-white" />
    </div>
  )
}

/** Hand-drawn note that appears while its beat runs (gated by --sg).
 *  Renders as a dark, blurred chip for legibility; `plain` skips the
 *  panel for notes that are mostly drawing. */
export function Note({
  seg: segVar,
  first,
  plain,
  className,
  children,
}: React.PropsWithChildren<{
  seg: string
  first?: boolean
  plain?: boolean
  className?: string
}>) {
  return (
    <div
      className={cn(
        'anatomy-note pointer-events-none absolute',
        plain
          ? 'text-[1.02rem] leading-snug text-white/90'
          : 'xp-note-chip',
        first && 'anatomy-note-first',
        fontHand.className,
        className,
      )}
      style={{ '--sg': `var(${segVar})` } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

export function Arrow({
  d,
  head,
  className,
  seg: segVar,
}: {
  d: string
  head: string
  className?: string
  seg?: string
}) {
  return (
    <svg
      className={cn('absolute', className)}
      viewBox="0 0 48 24"
      fill="none"
      style={
        segVar ? ({ '--sg': `var(${segVar})` } as React.CSSProperties) : undefined
      }
    >
      <path
        className="anatomy-draw"
        pathLength={1}
        d={d}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        className="anatomy-draw-head"
        pathLength={1}
        d={head}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * The stage: the input performing the story. Higher contrast than the old
 * build — brighter paint, whiter chars, stronger notes — and every arrow
 * is drawn in like a chalkboard lesson.
 */
export function StoryStage({ live }: { live: boolean }) {
  const [value, setValue] = React.useState(DEMO_VALUE)

  React.useEffect(() => {
    if (!live) setValue(DEMO_VALUE)
  }, [live])

  return (
    <div data-live={live} className="flex flex-col items-center">
      <div className="relative" style={{ width: STAGE_W }}>
        {/* Blueprint ghost: the invisible input's true footprint. */}
        <svg
          aria-hidden
          className="pointer-events-none absolute -inset-2.5"
          width={STAGE_W + 20}
          height={84}
          viewBox={`0 0 ${STAGE_W + 20} 84`}
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
            stroke="rgba(250, 250, 250, 0.7)"
            strokeWidth="1.5"
          />
        </svg>

        {/* The native input's paint, before it's stripped. */}
        <div
          aria-hidden
          className="anatomy-paint absolute inset-0 rounded-xl border border-white/40 bg-[#1c1c21]"
        />

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
                    {slot.char ?? (slot.hasFakeCaret ? <FakeCaret /> : null)}
                  </div>
                </div>
              ))}
            </>
          )}
        />

        {/* Beat 4: native selection sweeping across the slots. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 rounded-lg border border-white/30 bg-white/15"
          style={{
            width: 'calc(var(--selw, 0) * 100%)',
            opacity: 'var(--selo, 0)',
          }}
        />

        {/* The value, flying from native text into the slots. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {Array.from({ length: 6 }).map((_, i) => {
            const home = (i - 2.5) * CHAR_W
            const slotCenter = i * (SLOT_W + SLOT_GAP) + SLOT_W / 2
            const dx = slotCenter - (STAGE_W / 2 + home)
            return (
              <span
                key={i}
                className="anatomy-flyer text-xl font-medium tabular-nums text-white"
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

        {/* Hand-written margin notes, one per beat. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <Note
            seg="--seg0"
            first
            className="bottom-[calc(100%+34px)] left-[-30px] w-[300px] -rotate-2"
          >
            this is one real HTML input
            <Arrow
              seg="--seg0"
              className="left-[130px] top-[calc(100%+3px)] h-[24px] w-[48px]"
              d="M4 2 C 18 4, 32 10, 40 20"
              head="M33 17.5 L40 20 M40.5 13 L40 20"
            />
          </Note>

          <Note
            seg="--seg1"
            className="bottom-[calc(100%+34px)] right-[-34px] w-[330px] rotate-[1.5deg] text-right"
          >
            paint gone — value kept
            <Arrow
              seg="--seg1"
              className="right-[100px] top-[calc(100%+3px)] h-[24px] w-[48px]"
              d="M44 2 C 30 4, 16 10, 8 20"
              head="M15 17.5 L8 20 M7.5 13 L8 20"
            />
          </Note>

          <Note seg="--seg2" plain className="inset-x-0 top-[calc(100%+10px)]">
            <svg
              className="mx-auto block"
              width={STAGE_W}
              height={12}
              viewBox={`0 0 ${STAGE_W} 12`}
              fill="none"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <path
                  key={i}
                  className="anatomy-draw"
                  pathLength={1}
                  d={`M${i * (SLOT_W + SLOT_GAP) + 3} 1 v8 h${SLOT_W - 6} v-8`}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ '--sg': `var(--s${i})` } as React.CSSProperties}
                />
              ))}
            </svg>
            <div className="mt-2 -rotate-1 text-center">
              six fake slots, drawn by me
            </div>
          </Note>

          <Note
            seg="--seg3"
            className="bottom-[calc(100%+34px)] left-1/2 w-[340px] -translate-x-1/2 -rotate-1 text-center"
          >
            the hidden value, mirrored into fake texts
            <Arrow
              seg="--seg3"
              className="left-1/2 top-[calc(100%+2px)] h-[22px] w-[20px] -translate-x-1/2"
              d="M10 2 C 8 8, 10 13, 10 18"
              head="M5.5 14 L10 18 M14.5 14 L10 18"
            />
          </Note>

          <Note
            seg="--seg4"
            className="bottom-[calc(100%+34px)] right-[-30px] w-[320px] rotate-1 text-right"
          >
            drag across it — a real text selection
            <Arrow
              seg="--seg4"
              className="right-[120px] top-[calc(100%+3px)] h-[24px] w-[48px]"
              d="M44 2 C 30 4, 16 10, 8 20"
              head="M15 17.5 L8 20 M7.5 13 L8 20"
            />
          </Note>

          <Note
            seg="--seg6"
            className="bottom-[calc(100%+34px)] left-1/2 w-[300px] -translate-x-1/2 rotate-[-1.5deg] text-center"
          >
            it&apos;s live — type something
            <Arrow
              seg="--seg6"
              className="left-1/2 top-[calc(100%+2px)] h-[22px] w-[20px] -translate-x-1/2"
              d="M10 2 C 8 8, 10 13, 10 18"
              head="M5.5 14 L10 18 M14.5 14 L10 18"
            />
          </Note>
        </div>
      </div>

      {/* Compat props typing on, then swapping for the live readout. */}
      <div className="relative mt-9 h-32 w-full max-w-[27rem] font-mono text-xs leading-[1.9]">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0"
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
        <div
          aria-hidden
          className={cn(
            'anatomy-note absolute left-0.5 top-[97px] -rotate-1 text-[1.02rem] text-white/90',
            fontHand.className,
          )}
          style={{ '--sg': 'var(--seg5)' } as React.CSSProperties}
        >
          countless hours of DX, so you never think about this
        </div>
        <div
          aria-hidden
          className="absolute inset-x-0 top-0"
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
