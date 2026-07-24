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
      {/* Travel wrapper: left → centre → right */}
      <div
        className="grid place-items-center"
        style={{
          height: 300,
          transform: 'translateX(calc(var(--posx, 0) * 120px))',
        }}
      >
        <div className="relative" style={{ width: STAGE_W, height: 64 }}>
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
                        {slot.char ?? (slot.hasFakeCaret ? <FakeCaret /> : null)}
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

            {/* The input plane (hovers above the slots when exploded). */}
            <div aria-hidden className="xp-iso-plane absolute -inset-2.5">
              {/* Painted native input, before the paint is stripped. */}
              <div
                className="anatomy-paint absolute inset-0 rounded-xl border border-white/40 bg-[#1c1c21]"
              />
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

          {/* Hand-written margin notes, one per beat. */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <Note
              seg="--seg0"
              first
              className="bottom-[calc(100%+40px)] left-[-20px] w-max max-w-[300px] -rotate-2"
            >
              one real HTML input — paint and all
              <Arrow
                seg="--seg0"
                className="left-[130px] top-[calc(100%+3px)] h-[24px] w-[48px]"
                d="M4 2 C 18 4, 32 10, 40 20"
                head="M33 17.5 L40 20 M40.5 13 L40 20"
              />
            </Note>

            <Note
              seg="--seg1"
              className="bottom-[calc(100%+44px)] right-[-30px] w-max max-w-[320px] rotate-[1.5deg]"
            >
              paint gone — tilt it, it never left
              <Arrow
                seg="--seg1"
                className="right-[110px] top-[calc(100%+3px)] h-[24px] w-[48px]"
                d="M44 2 C 30 4, 16 10, 8 20"
                head="M15 17.5 L8 20 M7.5 13 L8 20"
              />
            </Note>

            <Note
              seg="--seg2"
              className="left-1/2 top-[calc(100%+64px)] w-max max-w-[320px] -translate-x-1/2 -rotate-1 text-center"
            >
              the slots live on a layer of their own
              <Arrow
                seg="--seg2"
                className="bottom-[calc(100%+2px)] left-1/2 h-[22px] w-[20px] -translate-x-1/2 -scale-y-100"
                d="M10 2 C 8 8, 10 13, 10 18"
                head="M5.5 14 L10 18 M14.5 14 L10 18"
              />
            </Note>

            <Note
              seg="--seg3"
              className="bottom-[calc(100%+58px)] left-1/2 w-max max-w-[320px] -translate-x-1/2 -rotate-1 text-center"
            >
              the hidden value drops into the slots
              <Arrow
                seg="--seg3"
                className="left-1/2 top-[calc(100%+2px)] h-[22px] w-[20px] -translate-x-1/2"
                d="M10 2 C 8 8, 10 13, 10 18"
                head="M5.5 14 L10 18 M14.5 14 L10 18"
              />
            </Note>

            <Note
              seg="--seg4"
              className="bottom-[calc(100%+58px)] right-[-24px] w-max max-w-[320px] rotate-1"
            >
              one selection — every layer follows
              <Arrow
                seg="--seg4"
                className="right-[120px] top-[calc(100%+3px)] h-[24px] w-[48px]"
                d="M44 2 C 30 4, 16 10, 8 20"
                head="M15 17.5 L8 20 M7.5 13 L8 20"
              />
            </Note>

            <Note
              seg="--seg6"
              className="bottom-[calc(100%+40px)] left-1/2 w-max max-w-[300px] -translate-x-1/2 rotate-[-1.5deg] text-center"
            >
              flat again — and live. type!
              <Arrow
                seg="--seg6"
                className="left-1/2 top-[calc(100%+2px)] h-[22px] w-[20px] -translate-x-1/2"
                d="M10 2 C 8 8, 10 13, 10 18"
                head="M5.5 14 L10 18 M14.5 14 L10 18"
              />
            </Note>
          </div>
        </div>
      </div>

      {/* Compat props typing on, then swapping for the live readout. */}
      <div className="relative mt-2 h-40 w-full max-w-[27rem] font-mono text-xs leading-[1.9]">
        <div
          aria-hidden
          className="absolute inset-x-0 top-[46px]"
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
        <Note seg="--seg5" className="left-0.5 top-0 -rotate-1">
          countless hours of DX, so you never think about this
        </Note>
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

/**
 * The final "How I built it": the margin-lecture text column from
 * variant 1, performed by the isometric stage.
 */
export function StoryIso() {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const sceneRef = React.useRef<HTMLDivElement>(null)
  const step = useStoryScrub(trackRef, sceneRef)

  return (
    <div ref={trackRef} className="relative h-[640vh]">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div
          ref={sceneRef}
          className="mx-auto grid w-full max-w-5xl items-center gap-y-10 px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-16"
        >
          <div className="flex gap-6">
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
