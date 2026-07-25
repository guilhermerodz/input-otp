'use client'

import * as React from 'react'
import { OTPInput } from 'input-otp'

import { cn } from '@/lib/utils'
import {
  peelClasses,
  SLOT_H,
  SLOT_W,
  StageSlot,
  usePeelPitch,
  type PeelId,
} from './shared'

interface Step {
  title: string
  caption: string
  code: string
  slots: boolean
  /** Whether the input's own plate is "in" — the amber sheet. */
  plate: boolean
  /** Hiding techniques still *undone* at this beat. */
  peels: PeelId[]
  /** The last beat also shows the live selection readout. */
  mirror?: boolean
}

/**
 * Seven beats, built so each one adds exactly one idea. Because `peels` lists
 * what is *not* yet applied, the input fades out as the walkthrough progresses —
 * the reveal running in reverse.
 */
const STEPS: Step[] = [
  {
    title: 'A positioned container',
    caption:
      'One relatively positioned box. It takes your containerClassName, and it is what a password manager measures against — but on its own it renders nothing at all.',
    code: 'position: relative; pointer-events: none',
    slots: false,
    plate: false,
    peels: [],
  },
  {
    title: 'Your slots',
    caption:
      'Ordinary children. Six divs, or four, or eight — whatever your render function returns. The library never touches them; it has no idea they are boxes.',
    code: '<div className="flex">{slots.map(…)}</div>',
    slots: true,
    plate: false,
    peels: [],
  },
  {
    title: 'One real input, laid over the top',
    caption:
      'A single <input>, absolutely positioned across the whole container and painted after your slots — so it wins the hit test and one click anywhere focuses it. Right now it is fully visible. Type into it.',
    code: 'position: absolute; inset: 0; pointer-events: all',
    slots: true,
    plate: true,
    peels: ['color', 'caret', 'bg', 'selection', 'tracking'],
  },
  {
    title: 'Crush the text',
    caption:
      'letter-spacing: -.5em collapses the value into a narrow band. The native selection highlight and the iOS long-press bubble are positioned from the text, so keeping it narrow keeps those affordances near the middle of the field instead of trailing off the end.',
    code: 'letter-spacing: -.5em; font-size: var(--root-height)',
    slots: true,
    plate: true,
    peels: ['color', 'caret', 'bg', 'selection'],
  },
  {
    title: 'Take away the box',
    caption:
      'Background and outline go transparent. This is what makes the component unstyled in the real sense: there is nothing of the library’s left to override.',
    code: 'background: transparent; border: 0; box-shadow: none',
    slots: true,
    plate: true,
    peels: ['color', 'caret', 'selection'],
  },
  {
    title: 'Take away the ink',
    caption:
      'The characters, the caret and the selection band all go transparent — separately, because each is painted by a different mechanism and none of them inherits from the others. Note that opacity is never used: iOS refuses to show its paste menu on a fully transparent input.',
    code: 'color: transparent; caret-color: transparent; ::selection { transparent }',
    slots: true,
    plate: true,
    peels: [],
  },
  {
    title: 'Mirror the selection',
    caption:
      'The invisible input is still the one holding the value and the caret. On every selectionchange the library reads its selection, widens a bare caret into a one-character range, and mirrors the result into the slots below. Arrow around — the highlight you see is a reflection.',
    code: 'slots[i].isActive = i >= mirrorStart && i < mirrorEnd',
    slots: true,
    plate: false,
    peels: [],
    mirror: true,
  },
]

const LAST = STEPS.length - 1

export function AnatomyAssembly() {
  const [step, setStep] = React.useState(0)
  const [playing, setPlaying] = React.useState(false)
  const [value, setValue] = React.useState('482')
  const stageRef = React.useRef<HTMLDivElement>(null)

  const current = STEPS[step]
  usePeelPitch(stageRef, current.peels.includes('tracking'))

  // Autoplay walks forward and parks on the last beat.
  React.useEffect(() => {
    if (!playing) return
    if (step === LAST) {
      setPlaying(false)
      return
    }
    const timer = setTimeout(() => setStep(s => Math.min(s + 1, LAST)), 2600)
    return () => clearTimeout(timer)
  }, [playing, step])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      setPlaying(false)
      setStep(s => Math.min(s + 1, LAST))
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      setPlaying(false)
      setStep(s => Math.max(s - 1, 0))
    }
  }

  return (
    <div className="otp-stage" ref={stageRef}>
      {/* ————— Stepper ————— */}
      <div
        role="tablist"
        aria-label="Assembly step"
        onKeyDown={onKeyDown}
        className="flex flex-wrap items-center gap-1.5 border-b border-border/70 bg-muted/20 px-4 py-3 sm:px-5"
      >
        {STEPS.map((s, idx) => (
          <button
            key={s.title}
            role="tab"
            type="button"
            aria-selected={idx === step}
            title={s.title}
            onClick={() => {
              setPlaying(false)
              setStep(idx)
            }}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full border font-mono text-[0.6875rem] transition-all duration-200',
              idx === step
                ? 'border-foreground/60 bg-foreground/[0.12] text-foreground'
                : idx < step
                  ? 'border-foreground/25 text-muted-foreground hover:text-foreground'
                  : 'border-border/70 text-muted-foreground/50 hover:text-foreground',
            )}
          >
            {idx + 1}
          </button>
        ))}

        <span aria-hidden className="mx-1 h-4 w-px bg-border/70" />

        <button
          type="button"
          onClick={() => {
            if (step === LAST) setStep(0)
            setPlaying(p => !p)
          }}
          className="rounded-md border border-border/70 px-2 py-1 text-[0.6875rem] text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          {playing ? 'Pause' : step === LAST ? 'Replay' : 'Play'}
        </button>

        <span className="ml-auto font-mono text-[0.6875rem] text-muted-foreground/60">
          {step + 1} / {STEPS.length}
        </span>
      </div>

      {/* ————— Stage ————— */}
      <div
        className={cn(
          'bg-dot-grid relative flex min-h-[15rem] items-center justify-center overflow-hidden px-4 py-14',
          ...peelClasses(current.peels),
        )}
      >
        {/* The container's footprint, so beat 1 has something to look at. */}
        <div
          aria-hidden
          className="otp-stage-floor pointer-events-none absolute"
          style={{
            width: SLOT_W * 6,
            height: SLOT_H,
            opacity: step === 0 ? 1 : 0.35,
          }}
        />

        <div
          className="relative"
          style={
            {
              ['--slot-in' as string]: current.slots ? 1 : 0,
              ['--plate-in' as string]: current.plate ? 1 : 0,
            } as React.CSSProperties
          }
        >
          <OTPInput
            maxLength={6}
            value={value}
            onChange={setValue}
            // Off for the anatomy stages: the badge gutter would make the
            // input plate wider than the container it is meant to sit inside.
            pushPasswordManagerStrategy="none"
            containerClassName="group flex items-center"
            render={({ slots }) => (
              <div className="flex">
                {slots.map((slot, idx) => (
                  <StageSlot
                    key={idx}
                    slot={slot}
                    index={idx}
                    showIndex={Boolean(current.mirror)}
                    className="otp-assembly-slot h-14 w-12"
                  />
                ))}
              </div>
            )}
          />

          {/* The input's plate outline — only while the plate is "in". */}
          <div
            aria-hidden
            className="otp-assembly-plate pointer-events-none absolute -inset-px rounded"
            style={{
              boxShadow: 'inset 0 0 0 1px hsl(28 90% 62% / 0.35)',
            }}
          />
        </div>

        {current.mirror && <MirrorReadout value={value} />}
      </div>

      {/* ————— Caption ————— */}
      <div className="border-t border-border/70 px-4 py-4 sm:px-5">
        <div className="flex items-baseline gap-2.5">
          <span className="font-mono text-[0.6875rem] text-muted-foreground/60">
            {String(step + 1).padStart(2, '0')}
          </span>
          <h4 className="text-sm font-semibold tracking-tight text-foreground">
            {current.title}
          </h4>
        </div>
        <p className="mt-1.5 max-w-2xl text-[0.875rem] leading-6 text-muted-foreground">
          {current.caption}
        </p>
        <code className="mt-2.5 block overflow-x-auto whitespace-pre font-mono text-[0.6875rem] leading-5 text-amber-200/70">
          {current.code}
        </code>
      </div>
    </div>
  )
}

/** Beat 7: the numbers being mirrored, read live off the real input. */
function MirrorReadout({ value }: { value: string }) {
  const [sel, setSel] = React.useState<[number, number] | null>(null)

  React.useEffect(() => {
    const read = () => {
      const input = document.activeElement
      if (!(input instanceof HTMLInputElement) || !input.dataset.inputOtp) {
        setSel(null)
        return
      }
      setSel([input.selectionStart ?? 0, input.selectionEnd ?? 0])
    }
    read()
    document.addEventListener('selectionchange', read)
    document.addEventListener('focusout', read)
    return () => {
      document.removeEventListener('selectionchange', read)
      document.removeEventListener('focusout', read)
    }
  }, [value])

  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded border border-border/70 bg-background/80 px-2.5 py-1 font-mono text-[0.6875rem] text-muted-foreground backdrop-blur">
      {sel ? (
        <>
          selection <span className="text-amber-300">{sel[0]}</span> →{' '}
          <span className="text-amber-300">{sel[1]}</span>
          <span className="mx-1.5 text-muted-foreground/40">·</span>
          active slot{' '}
          <span className="text-foreground">
            {sel[1] > sel[0]
              ? Array.from(
                  { length: sel[1] - sel[0] },
                  (_, i) => sel[0] + i,
                ).join(', ')
              : sel[0]}
          </span>
        </>
      ) : (
        <span className="text-muted-foreground/60">
          click the field to see the mirror
        </span>
      )}
    </div>
  )
}
