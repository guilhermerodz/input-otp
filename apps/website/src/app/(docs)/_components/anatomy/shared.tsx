'use client'

import * as React from 'react'
import type { SlotProps } from 'input-otp'

import { cn } from '@/lib/utils'

/** The stage's slot geometry. Fixed, because the peel maths depends on it. */
export const SLOT_W = 48
export const SLOT_H = 56

/** The five inline styles that make the real input disappear. */
export const PEELS = [
  {
    id: 'color',
    css: 'color: transparent',
    label: 'The characters',
    hides:
      'The value itself. Without this you would see the real text sitting on top of your slots.',
  },
  {
    id: 'caret',
    css: 'caret-color: transparent',
    label: 'The caret',
    hides:
      'The native blinking caret. It lands wherever the collapsed text puts it, which is never where a slot is — so you draw your own instead.',
  },
  {
    id: 'bg',
    css: 'background: transparent',
    label: 'The box',
    hides:
      "The field's own background and outline. This is the whole reason the component can be unstyled: there is nothing of the library's to override.",
  },
  {
    id: 'selection',
    css: '::selection { transparent }',
    label: 'The selection band',
    hides:
      'The browser paints selection with its own colours and ignores the element’s. Both the background and the text colour have to be neutralised, or selected characters reappear.',
  },
  {
    id: 'tracking',
    css: 'letter-spacing: -.5em',
    label: 'The tracking',
    hides:
      'Nothing — it crushes the text into a narrow band so the native selection UI and the iOS long-press bubble stay near the middle of the field.',
  },
] as const

export type PeelId = (typeof PEELS)[number]['id']

export function peelClasses(active: Iterable<PeelId>) {
  return Array.from(active, id => `otp-peel-${id}`)
}

/**
 * The stage's slot. Same contract as the docs' `Slot`, plus the extras these
 * walkthroughs need: an index badge, a dim state, and a per-slot `--i` so a
 * row can stagger itself.
 */
export function StageSlot({
  slot,
  index,
  showIndex,
  dim,
  className,
  style,
}: {
  slot: SlotProps
  index: number
  showIndex?: boolean
  dim?: boolean
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{ ['--i' as string]: index, ...style }}
      className={cn(
        'relative flex items-center justify-center',
        'border-y border-r border-foreground/20 bg-foreground/[0.02]',
        'first:rounded-l-md first:border-l last:rounded-r-md',
        'text-[1.375rem] font-medium tabular-nums text-foreground',
        'outline outline-0 outline-offset-0 outline-foreground/80',
        'transition-all duration-200',
        slot.isActive && 'z-10 outline-2',
        dim && 'opacity-35',
        className,
      )}
    >
      <span style={{ width: SLOT_W, height: SLOT_H }} className="absolute" />
      <span className="relative">{slot.char ?? slot.placeholderChar}</span>

      {slot.hasFakeCaret && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-7 w-px bg-foreground motion-safe:animate-caret-blink" />
        </span>
      )}

      {showIndex && (
        <span
          aria-hidden
          className="absolute bottom-0.5 font-mono text-[0.5625rem] leading-none text-muted-foreground/45"
        >
          {index}
        </span>
      )}
    </div>
  )
}

/** A colour-coded legend/label for one of the three layers. */
export function LayerChip({
  tone,
  z,
  title,
  active,
  onClick,
  children,
}: {
  tone: 'cyan' | 'amber' | 'plain'
  z: number
  title: string
  active?: boolean
  onClick?: () => void
  children?: React.ReactNode
}) {
  const tones = {
    cyan: 'border-sky-400/40 bg-sky-400/[0.07] text-sky-200/90',
    amber: 'border-amber-400/40 bg-amber-400/[0.07] text-amber-200/90',
    plain: 'border-border/70 bg-foreground/[0.03] text-foreground/80',
  }
  const swatches = {
    cyan: 'border-sky-400/70',
    amber: 'border-amber-400/70',
    plain: 'border-foreground/40',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'w-full rounded-lg border px-3 py-2.5 text-left transition-all duration-200',
        tones[tone],
        active
          ? 'ring-1 ring-inset ring-foreground/25'
          : 'opacity-60 hover:opacity-100',
        !onClick && 'cursor-default',
      )}
    >
      <span className="flex items-center gap-2">
        <span
          aria-hidden
          className={cn(
            'h-2.5 w-5 shrink-0 rounded-sm border border-dashed',
            swatches[tone],
          )}
        />
        <span className="font-mono text-[0.625rem] text-current/60">z {z}</span>
        <span className="text-[0.8125rem] font-medium text-foreground">
          {title}
        </span>
      </span>
      {children && (
        <span className="mt-1 block text-[0.75rem] leading-5 text-muted-foreground">
          {children}
        </span>
      )}
    </button>
  )
}

/** Segmented control, matching the one in the password manager simulator. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  mono,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (next: T) => void
  mono?: boolean
}) {
  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-md border border-border/70 bg-background/60 p-0.5">
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded px-2.5 py-1 text-xs transition-colors duration-150',
            mono && 'font-mono text-[0.6875rem]',
            value === option.value
              ? 'bg-foreground/[0.1] text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function Toggle({
  checked,
  onChange,
  disabled,
  children,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <label
      className={cn(
        'flex items-center gap-2 text-xs',
        disabled
          ? 'cursor-not-allowed text-muted-foreground/50'
          : 'cursor-pointer text-muted-foreground hover:text-foreground',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={e => onChange(e.target.checked)}
        className="h-3.5 w-3.5 accent-amber-400"
      />
      {children}
    </label>
  )
}

/**
 * Measures the input's real per-character advance and writes the tracking that
 * puts exactly one character over one slot.
 *
 * Guessing this from `em` values would drift with whatever the platform calls
 * `monospace`, and a misaligned reveal would undercut the whole point of the
 * demo — so it is measured from the font the browser actually resolved.
 */
export function usePeelPitch(
  stageRef: React.RefObject<HTMLElement>,
  enabled: boolean,
) {
  React.useEffect(() => {
    const stage = stageRef.current
    if (!stage || !enabled) return

    const input = stage.querySelector<HTMLInputElement>('[data-input-otp]')
    if (!input) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // The peel sets font-size: 1.375rem; measure at that size, not the
    // collapsed one the library uses.
    const { fontFamily } = getComputedStyle(input)
    ctx.font = `22px ${fontFamily}`
    const advance = ctx.measureText('0').width
    if (!advance) return

    stage.style.setProperty('--peel-spacing', `${SLOT_W - advance}px`)
    stage.style.setProperty('--peel-indent', `${(SLOT_W - advance) / 2}px`)
  }, [stageRef, enabled])
}
