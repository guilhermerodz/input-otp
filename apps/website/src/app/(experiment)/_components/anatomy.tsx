'use client'

import * as React from 'react'
import { OTPInput, REGEXP_ONLY_DIGITS } from 'input-otp'
import { fontHand } from '@/lib/fonts'
import { cn } from '@/lib/utils'

const SLOT_W = 40
const SLOT_GAP = 8
const CHAR_W = 11
const STAGE_W = 6 * SLOT_W + 5 * SLOT_GAP
/** The canonical value the story is told with. */
const DEMO_VALUE = '141952'

const STEPS = [
  {
    title: 'I started with a real <input>',
    body: 'Not a div pretending to be one. Paste, caret, selection, autofill — the browser had already solved text entry.',
  },
  {
    title: 'Then I stripped its paint',
    body: 'Background and border went transparent. The input is still there, stretched over the whole container — the dashed line is its footprint.',
  },
  {
    title: 'I drew my own slots',
    body: 'Six plain divs. They are pure presentation — style them however your design wants.',
  },
  {
    title: 'I mirrored the value',
    body: 'Each slot renders one character of the real value, while the native text hides behind color: transparent and a collapsed letter-spacing.',
  },
  {
    title: 'I absorbed the quirks',
    body: 'SMS autofill, mobile keyboards, password-manager badges, WebKit opinions — all wired in so you never think about them.',
  },
  {
    title: 'Boom — input-otp',
    body: 'One real input, wearing your design. The most installed OTP input on npm — go ahead, type in it.',
  },
] as const

const ATTRS = [
  { code: 'autoComplete="one-time-code"', note: 'one-tap SMS codes' },
  { code: 'inputMode="numeric"', note: 'the right mobile keyboard' },
  { code: 'clipPath="inset(0 40px 0 0)"', note: 'dodges password-manager badges' },
  { code: 'WebkitTextFillColor="transparent"', note: 'WebKit has opinions' },
] as const

/** Scroll-progress boundaries between the six beats. */
const BOUNDS = [0.14, 0.32, 0.5, 0.68, 0.86] as const
/** Mid-beat progress targets for rail navigation. */
const JUMPS = [0.05, 0.22, 0.4, 0.58, 0.76, 0.94] as const

function seg(p: number, a: number, b: number) {
  return Math.min(1, Math.max(0, (p - a) / (b - a)))
}
function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3)
}
function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

type Snapshot = {
  start: number | null
  end: number | null
  caret: number | null
  focused: boolean
}

/**
 * Scroll-scrubbed story of how input-otp works: a painted native input
 * loses its paint, grows slots, hands its value over to them, learns the
 * browser quirks and ends as the live component. All interpolation is
 * done with CSS custom properties set once per scroll frame.
 */
export function Anatomy({ className }: { className?: string }) {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const sceneRef = React.useRef<HTMLDivElement>(null)
  const [step, setStep] = React.useState(0)
  const [value, setValue] = React.useState(DEMO_VALUE)
  const [snap, setSnap] = React.useState<Snapshot>({
    start: null,
    end: null,
    caret: null,
    focused: false,
  })

  const live = step === 5

  // The story beats depend on a full value; whatever the user typed in the
  // live beat resets once they scroll back into the story.
  React.useEffect(() => {
    if (!live) {
      setValue(DEMO_VALUE)
    }
  }, [live])

  React.useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const track = trackRef.current
      const scene = sceneRef.current
      if (!track || !scene) {
        return
      }
      const rect = track.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0

      const s = scene.style
      s.setProperty('--paint', (1 - seg(p, 0.14, 0.28)).toFixed(4))
      s.setProperty(
        '--ghost',
        (seg(p, 0.14, 0.28) * (1 - seg(p, 0.88, 0.96))).toFixed(4),
      )
      s.setProperty('--caret', (1 - seg(p, 0.46, 0.52)).toFixed(4))
      s.setProperty('--boom', seg(p, 0.86, 0.96).toFixed(4))
      s.setProperty('--aout', seg(p, 0.84, 0.885).toFixed(4))
      s.setProperty('--rin', seg(p, 0.905, 0.96).toFixed(4))
      // Per-phase progress: 0 → 1 across each beat, for the progress rails.
      const edges = [0, ...BOUNDS, 1]
      for (let i = 0; i < STEPS.length; i++) {
        s.setProperty(`--seg${i}`, seg(p, edges[i], edges[i + 1]).toFixed(4))
      }
      for (let i = 0; i < 6; i++) {
        const rise = seg(p, 0.32 + i * 0.015, 0.4 + i * 0.015)
        const fly = seg(p, 0.5 + i * 0.018, 0.6 + i * 0.018)
        s.setProperty(`--s${i}`, easeOut(rise).toFixed(4))
        s.setProperty(`--f${i}`, easeInOut(fly).toFixed(4))
      }
      for (let j = 0; j < ATTRS.length; j++) {
        const at = seg(p, 0.68 + j * 0.035, 0.74 + j * 0.035)
        s.setProperty(`--a${j}`, easeOut(at).toFixed(4))
      }

      let next = 0
      for (const b of BOUNDS) {
        if (p >= b) {
          next++
        }
      }
      setStep(next)
    }
    const onScroll = () => {
      if (!raf) {
        raf = requestAnimationFrame(update)
      }
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const jumpTo = (i: number) => {
    const track = trackRef.current
    if (!track) {
      return
    }
    const rect = track.getBoundingClientRect()
    const total = rect.height - window.innerHeight
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    window.scrollTo({
      top: window.scrollY + rect.top + JUMPS[i] * total,
      behavior: reduce ? 'auto' : 'smooth',
    })
  }

  const paddedValue = (
    <>
      {value}
      <span className="text-muted-foreground">
        {'·'.repeat(6 - value.length)}
      </span>
    </>
  )

  return (
    <div ref={trackRef} className={cn('relative h-[520vh]', className)}>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div
          ref={sceneRef}
          data-live={live}
          className="mx-auto grid w-full max-w-5xl items-center gap-y-8 px-6 lg:justify-items-center lg:gap-y-24"
        >
          {/* ————— Step bar (desktop) ————— */}
          <StepBar step={step} jumpTo={jumpTo} />

          {/* ————— Stage ————— */}
          <div className="flex flex-col items-center">
            <div className="relative" style={{ width: STAGE_W }}>
              {/* Blueprint ghost: the invisible input's true footprint. */}
              <svg
                aria-hidden
                className="pointer-events-none absolute -inset-2"
                width={STAGE_W + 16}
                height={72}
                viewBox={`0 0 ${STAGE_W + 16} 72`}
                fill="none"
                style={{ opacity: 'var(--ghost, 0)' }}
              >
                <rect
                  className="anatomy-ants"
                  x="0.75"
                  y="0.75"
                  width={STAGE_W + 14.5}
                  height={70.5}
                  rx="12"
                  stroke="hsl(var(--foreground) / 0.55)"
                  strokeWidth="1.5"
                />
              </svg>

              {/* The native input's paint, before it's stripped. */}
              <div
                aria-hidden
                className="anatomy-paint absolute inset-0 rounded-lg border border-foreground/30 bg-muted/70"
              />

              <OTPInput
                maxLength={6}
                value={value}
                onChange={setValue}
                pattern={REGEXP_ONLY_DIGITS}
                disabled={!live}
                aria-label="Try input-otp: six-digit demo code"
                containerClassName="relative flex items-center"
                render={({ slots, isFocused }) => (
                  <>
                    <Probe
                      slots={slots}
                      isFocused={isFocused}
                      onSnapshot={setSnap}
                    />
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
                          'anatomy-slot keycap relative flex h-14 w-10 items-center justify-center rounded-md text-lg font-medium tabular-nums',
                          idx > 0 && 'ml-2',
                          live &&
                            slot.isActive &&
                            '!border-foreground/80 shadow-[0_0_0_1px_hsl(var(--foreground)/0.8)]',
                        )}
                      >
                        <div className="anatomy-slot-char">
                          {slot.char ??
                            (slot.hasFakeCaret ? <FakeCaret /> : null)}
                        </div>
                      </div>
                    ))}
                  </>
                )}
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
                      className="anatomy-flyer text-lg font-medium tabular-nums"
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
                      (value.length - 3.5) * CHAR_W + 7
                    }px)`,
                  }}
                >
                  <span className="block h-5 w-px bg-foreground motion-safe:animate-caret-blink" />
                </span>
              </div>

              {/* Hand-drawn annotations, one per beat. */}
              <div
                aria-hidden
                className={cn(
                  'pointer-events-none absolute inset-0 text-[0.95rem] leading-snug text-foreground/75',
                  fontHand.className,
                )}
              >
                <div
                  className="anatomy-note anatomy-note-first absolute bottom-[calc(100%+30px)] left-[-24px] w-[300px] -rotate-2"
                  style={{ '--sg': 'var(--seg0)' } as React.CSSProperties}
                >
                  This is a real single HTML input
                  <svg
                    className="absolute left-[150px] top-[calc(100%+3px)] h-[24px] w-[48px]"
                    viewBox="0 0 48 24"
                    fill="none"
                  >
                    <path
                      className="anatomy-draw"
                      pathLength={1}
                      d="M4 2 C 18 4, 32 10, 40 20"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      className="anatomy-draw-head"
                      pathLength={1}
                      d="M33 17.5 L40 20 M40.5 13 L40 20"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div
                  className="anatomy-note absolute bottom-[calc(100%+30px)] right-[-32px] w-[330px] rotate-[1.5deg] text-right"
                  style={{ '--sg': 'var(--seg1)' } as React.CSSProperties}
                >
                  Made it fully transparent and kept its value
                  <svg
                    className="absolute right-[150px] top-[calc(100%+3px)] h-[24px] w-[48px]"
                    viewBox="0 0 48 24"
                    fill="none"
                  >
                    <path
                      className="anatomy-draw"
                      pathLength={1}
                      d="M44 2 C 30 4, 16 10, 8 20"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      className="anatomy-draw-head"
                      pathLength={1}
                      d="M15 17.5 L8 20 M7.5 13 L8 20"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div
                  className="anatomy-note absolute inset-x-0 top-[calc(100%+8px)]"
                  style={{ '--sg': 'var(--seg2)' } as React.CSSProperties}
                >
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
                    I drew fake div slots into the UI
                  </div>
                </div>

                <div
                  className="anatomy-note absolute bottom-[calc(100%+30px)] left-1/2 w-[340px] -translate-x-1/2 -rotate-1 text-center"
                  style={{ '--sg': 'var(--seg3)' } as React.CSSProperties}
                >
                  I&apos;ve hidden the real value and mirrored it in fake texts
                  <svg
                    className="absolute left-1/2 top-[calc(100%+2px)] h-[22px] w-[20px] -translate-x-1/2"
                    viewBox="0 0 20 22"
                    fill="none"
                  >
                    <path
                      className="anatomy-draw"
                      pathLength={1}
                      d="M10 2 C 8 8, 10 13, 10 18"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      className="anatomy-draw-head"
                      pathLength={1}
                      d="M5.5 14 L10 18 M14.5 14 L10 18"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Compat props typing on, then swapping for the live readout. */}
            <div className="relative mt-7 h-32 w-full max-w-[26rem] font-mono text-xs leading-[1.9]">
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
                    <span className="text-foreground/90">{attr.code}</span>{' '}
                    <span className="hidden text-muted-foreground/80 sm:inline">
                      · {attr.note}
                    </span>
                  </div>
                ))}
              </div>
              <div
                aria-hidden
                className={cn(
                  'anatomy-note absolute left-0.5 top-[97px] -rotate-1 text-[0.95rem] text-foreground/75',
                  fontHand.className,
                )}
                style={{ '--sg': 'var(--seg4)' } as React.CSSProperties}
              >
                I spent countless hours implementing a great DX
              </div>
              <div
                aria-hidden
                className="absolute inset-x-0 top-0"
                style={{ opacity: 'var(--rin, 0)' }}
              >
                <div className="text-muted-foreground/70">
                  {'// the hidden <input>, live'}
                </div>
                <div className="grid w-fit grid-cols-[auto_auto] gap-x-8">
                  <span className="text-muted-foreground">value</span>
                  <span className="text-foreground">
                    &quot;{paddedValue}&quot;
                  </span>
                  <span className="text-muted-foreground">selection</span>
                  <span className="text-foreground">
                    {snap.start === null ? '—' : `[${snap.start}, ${snap.end}]`}
                  </span>
                  <span className="text-muted-foreground">caret</span>
                  <span className="text-foreground">
                    {snap.caret === null ? (
                      '—'
                    ) : (
                      <>
                        slot {snap.caret + 1}
                        <span className="ml-1.5 inline-block h-3 w-px translate-y-0.5 bg-foreground motion-safe:animate-caret-blink" />
                      </>
                    )}
                  </span>
                  <span className="text-muted-foreground">focused</span>
                  <span
                    className={cn(
                      snap.focused ? 'text-emerald-400' : 'text-foreground',
                    )}
                  >
                    {String(snap.focused)}
                  </span>
                </div>
              </div>
            </div>

            {/* ————— Current step caption (mobile) ————— */}
            <div className="mt-6 min-h-[8.5rem] w-full max-w-sm lg:hidden">
              <div aria-hidden className="mb-5 flex gap-1.5">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className="relative h-1 flex-1 overflow-hidden rounded-full bg-border"
                  >
                    <span
                      className="anatomy-segbar-fill absolute inset-0 rounded-full bg-foreground"
                      style={{ '--sg': `var(--seg${i})` } as React.CSSProperties}
                    />
                  </span>
                ))}
              </div>
              <div key={step} className="flex gap-3.5 animate-fade-in">
                <StepChip active>{step + 1}</StepChip>
                <div className="min-w-0">
                  <h3 className="font-mono text-sm font-semibold">
                    {STEPS[step].title}
                  </h3>
                  <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {STEPS[step].body}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type RailProps = {
  step: number
  jumpTo: (i: number) => void
}

const RAIL_LABEL = 'How input-otp is built, step by step'

/**
 * Variant 5: horizontal stepper. Six chips sit centered above the stage;
 * the active step's label grows out left-to-right as its phase begins and
 * collapses right-to-left as it ends — all width comes straight from the
 * scroll-driven --seg vars, so the bar reflows with the scrub. Each pill
 * is underlined by its own phase-progress fill.
 */
function StepBar({ step, jumpTo }: RailProps) {
  return (
    <ol
      aria-label={RAIL_LABEL}
      className="hidden items-center justify-center gap-2.5 lg:flex"
    >
      {STEPS.map((s, i) => (
        <li key={s.title}>
          <button
            type="button"
            onClick={() => jumpTo(i)}
            aria-current={step === i ? 'step' : undefined}
            data-first={i === 0}
            data-last={i === STEPS.length - 1}
            className={cn(
              'anatomy5-item group relative flex items-center transition-opacity duration-300 ease-out',
              step === i ? 'opacity-100' : 'opacity-50 hover:opacity-80',
            )}
            style={{ '--sg': `var(--seg${i})` } as React.CSSProperties}
          >
            <StepChip active={step === i}>{i + 1}</StepChip>
            <span aria-hidden={step !== i} className="anatomy5-label">
              <span className="block whitespace-nowrap pl-2.5 pr-1 font-mono text-sm font-semibold">
                {s.title}
              </span>
            </span>
            <span
              aria-hidden
              className="absolute -bottom-2.5 left-0 right-0 h-0.5 overflow-hidden rounded-full bg-border"
            >
              <span className="anatomy-segbar-fill absolute inset-0 rounded-full bg-foreground" />
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}

function StepChip({
  active,
  children,
}: React.PropsWithChildren<{ active?: boolean }>) {
  return (
    <span
      className={cn(
        'keycap mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-medium tabular-nums transition-[box-shadow,border-color] duration-300 ease-out',
        active && '!border-foreground/80 shadow-[0_0_0_1px_hsl(var(--foreground)/0.8)]',
      )}
    >
      {children}
    </span>
  )
}

/** Reports selection, caret + focus of the real hidden input up without side effects. */
function Probe({
  slots,
  isFocused,
  onSnapshot,
}: {
  slots: { isActive: boolean; hasFakeCaret: boolean }[]
  isFocused: boolean
  onSnapshot: (snap: Snapshot) => void
}) {
  const first = slots.findIndex(s => s.isActive)
  const last =
    slots.length - 1 - [...slots].reverse().findIndex(s => s.isActive)
  const start = first === -1 ? null : first
  const end = first === -1 ? null : last + 1
  const caretIdx = slots.findIndex(s => s.hasFakeCaret)
  const caret = caretIdx === -1 ? null : caretIdx

  React.useEffect(() => {
    onSnapshot({ start, end, caret, focused: isFocused })
  }, [start, end, caret, isFocused, onSnapshot])

  return null
}

function FakeCaret() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center motion-safe:animate-caret-blink">
      <div className="h-5 w-px bg-foreground" />
    </div>
  )
}
