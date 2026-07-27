'use client'

import * as React from 'react'
import { OTPInput } from 'input-otp'

import { cn } from '@/lib/utils'
import {
  peelClasses,
  PEELS,
  SLOT_H,
  SLOT_W,
  StageSlot,
  usePeelPitch,
  type PeelId,
} from './shared'

const ALL: PeelId[] = PEELS.map(p => p.id)

/**
 * The recipe, one ingredient at a time.
 *
 * Making an input invisible is not one property — it is five, none of which
 * implies the others. Switch each one back on and you see precisely what it was
 * responsible for hiding.
 */
export function AnatomyPeel() {
  const [on, setOn] = React.useState<Set<PeelId>>(new Set(ALL))
  const [hovered, setHovered] = React.useState<PeelId | null>(null)
  const [value, setValue] = React.useState('482')
  const stageRef = React.useRef<HTMLDivElement>(null)

  usePeelPitch(stageRef, on.has('tracking'))

  const toggle = (id: PeelId) =>
    setOn(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  // Hovering a row previews it, so you can read what a property does without
  // losing the state you already set up.
  const shown = React.useMemo(() => {
    const set = new Set(on)
    if (hovered) set.add(hovered)
    return set
  }, [on, hovered])

  const hiddenCount = ALL.length - on.size

  return (
    <div className="otp-stage" ref={stageRef}>
      {/* ————— Stage ————— */}
      <div
        className={cn(
          'bg-dot-grid relative flex min-h-[14rem] items-center justify-center overflow-hidden px-4 py-14',
          ...peelClasses(shown),
        )}
      >
        <div
          aria-hidden
          className="otp-stage-floor pointer-events-none absolute opacity-40"
          style={{ width: SLOT_W * 6, height: SLOT_H }}
        />

        <OTPInput
          maxLength={6}
          value={value}
          onChange={setValue}
          pushPasswordManagerStrategy="none"
          containerClassName="group flex items-center"
          render={({ slots }) => (
            <div className="flex">
              {slots.map((slot, idx) => (
                <StageSlot
                  key={idx}
                  slot={slot}
                  index={idx}
                  className="h-14 w-12"
                />
              ))}
            </div>
          )}
        />

        <p className="pointer-events-none absolute bottom-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[0.625rem] text-muted-foreground/50">
          {shown.size === ALL.length
            ? 'every hiding technique undone — this is the raw input'
            : shown.size === 0
              ? 'all five applied — the input is gone, and the field is yours'
              : `${ALL.length - shown.size} of ${ALL.length} applied`}
        </p>
      </div>

      {/* ————— The recipe ————— */}
      <div className="border-t border-border/70">
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
            What makes it invisible
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setOn(new Set())}
              className="rounded-md border border-border/70 px-2 py-1 text-[0.6875rem] text-muted-foreground transition-colors duration-150 hover:text-foreground"
            >
              Apply all
            </button>
            <button
              type="button"
              onClick={() => setOn(new Set(ALL))}
              className="rounded-md border border-border/70 px-2 py-1 text-[0.6875rem] text-muted-foreground transition-colors duration-150 hover:text-foreground"
            >
              Undo all
            </button>
          </div>
        </div>

        <ul className="divide-y divide-border/60 border-t border-border/60">
          {PEELS.map(peel => {
            const applied = !on.has(peel.id)
            return (
              <li key={peel.id}>
                <button
                  type="button"
                  aria-pressed={applied}
                  onClick={() => toggle(peel.id)}
                  onMouseEnter={() => applied && setHovered(peel.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => applied && setHovered(peel.id)}
                  onBlur={() => setHovered(null)}
                  className="group/row flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-foreground/[0.02] sm:px-5"
                >
                  <span
                    aria-hidden
                    className={cn(
                      'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors duration-200',
                      applied
                        ? 'border-amber-400/60 bg-amber-400/20 text-amber-300'
                        : 'border-border text-transparent',
                    )}
                  >
                    <svg
                      viewBox="0 0 10 10"
                      className="h-2.5 w-2.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    >
                      <path d="M1.5 5.2 3.8 7.5 8.5 2.5" />
                    </svg>
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                      <code className="font-mono text-[0.75rem] text-foreground">
                        {peel.css}
                      </code>
                      <span
                        className={cn(
                          'font-mono text-[0.625rem] uppercase tracking-wide transition-colors duration-200',
                          applied
                            ? 'text-muted-foreground/50'
                            : 'text-amber-300/80',
                        )}
                      >
                        {applied ? 'applied' : 'undone'}
                      </span>
                    </span>
                    <span className="mt-1 block text-[0.8125rem] leading-6 text-muted-foreground">
                      <span className="text-foreground/80">{peel.label}.</span>{' '}
                      {peel.hides}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <p className="border-t border-border/60 px-4 py-3.5 text-[0.8125rem] leading-6 text-muted-foreground sm:px-5">
          {hiddenCount === ALL.length ? (
            <>
              All five applied — and notice what is <em>not</em> in the list:{' '}
              <code className="font-mono text-[0.85em] text-foreground">
                opacity: 0
              </code>
              . The input keeps{' '}
              <code className="font-mono text-[0.85em] text-foreground">
                opacity: 1
              </code>{' '}
              throughout, because iOS refuses to show its long-press paste menu
              on a fully transparent field. Five separate properties instead of
              one, for that reason alone.
            </>
          ) : (
            <>Hover a row you have applied to preview it without changing it.</>
          )}
        </p>
      </div>
    </div>
  )
}
