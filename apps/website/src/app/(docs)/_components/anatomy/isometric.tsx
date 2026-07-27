'use client'

import * as React from 'react'
import { OTPInput } from 'input-otp'

import { cn } from '@/lib/utils'
import {
  LayerChip,
  SLOT_H,
  SLOT_W,
  StageSlot,
  Toggle,
  usePeelPitch,
} from './shared'

type LayerId = 'container' | 'slots' | 'input'

const LAYERS: {
  id: LayerId
  z: number
  tone: 'cyan' | 'plain' | 'amber'
  title: string
  blurb: string
  code: string
}[] = [
  {
    id: 'container',
    z: 0,
    tone: 'cyan',
    title: 'The container',
    blurb:
      'Relatively positioned, pointer-events: none, user-select: none. Renders nothing; it exists to establish the coordinate space the other two live in.',
    code: `<div
  data-input-otp-container
  style="position: relative; pointer-events: none; user-select: none"
  class={containerClassName}
>`,
  },
  {
    id: 'slots',
    z: 1,
    tone: 'plain',
    title: 'Your slots',
    blurb:
      'Whatever your render function returns. Painted first, so anything above wins the hit test — which is fine, because they are decoration and should never receive a click.',
    code: `<div className="flex">
  {slots.map((slot, i) => <Slot key={i} {...slot} />)}
</div>`,
  },
  {
    id: 'input',
    z: 2,
    tone: 'amber',
    title: 'The real input',
    blurb:
      'Absolutely positioned across the whole container and painted last, so it takes every click. The only node in the field with pointer-events: all — which is why one tap anywhere lands the caret on the slot you aimed at.',
    code: `<div style="position: absolute; inset: 0; pointer-events: none">
  <input data-input-otp style="… pointer-events: all" />
</div>`,
  },
]

export function AnatomyIsometric() {
  const [tilt, setTilt] = React.useState(true)
  const [explode, setExplode] = React.useState(72)
  const [reveal, setReveal] = React.useState(true)
  const [focused, setFocused] = React.useState<LayerId | null>(null)
  const [value, setValue] = React.useState('482')
  const stageRef = React.useRef<HTMLDivElement>(null)

  usePeelPitch(stageRef, reveal)

  const separation = tilt ? explode : 0
  const dim = (id: LayerId) => focused !== null && focused !== id
  const active = focused ? LAYERS.find(l => l.id === focused) : null

  return (
    <div className="otp-stage" ref={stageRef}>
      {/* ————— Controls ————— */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-border/70 bg-muted/20 px-4 py-3 sm:px-5">
        <Toggle checked={tilt} onChange={setTilt}>
          Isometric view
        </Toggle>

        <label
          className={cn(
            'flex items-center gap-2 text-xs',
            tilt ? 'text-muted-foreground' : 'text-muted-foreground/40',
          )}
        >
          Separation
          <input
            type="range"
            min={0}
            max={140}
            step={4}
            value={explode}
            disabled={!tilt}
            onChange={e => setExplode(Number(e.target.value))}
            className="h-1 w-28 accent-amber-400"
          />
          <span className="w-9 font-mono text-[0.6875rem] text-muted-foreground/70">
            {separation}px
          </span>
        </label>

        <Toggle checked={reveal} onChange={setReveal}>
          Reveal the input
        </Toggle>

        {focused && (
          <button
            type="button"
            onClick={() => setFocused(null)}
            className="ml-auto rounded-md border border-border/70 px-2 py-1 text-[0.6875rem] text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            Show all layers
          </button>
        )}
      </div>

      {/* ————— Board ————— */}
      <div
        className={cn(
          'bg-dot-grid relative flex items-center justify-center overflow-hidden px-4 transition-[padding] duration-700',
          tilt ? 'py-24 sm:py-28' : 'py-16',
          reveal && 'otp-peel-color otp-peel-caret otp-peel-bg',
          reveal && 'otp-peel-selection otp-peel-tracking',
        )}
      >
        <div
          className="otp-iso-board relative"
          style={
            {
              ['--tilt' as string]: tilt ? 1 : 0,
              ['--explode' as string]: separation,
            } as React.CSSProperties
          }
        >
          {/* z 0 — the container's plate. */}
          <div
            aria-hidden
            className={cn(
              'otp-stage-floor pointer-events-none absolute inset-0 transition-opacity duration-300',
              dim('container') && 'opacity-25',
            )}
          />

          <OTPInput
            maxLength={6}
            value={value}
            onChange={setValue}
            // Off here: the 40px badge gutter would make the input plane wider
            // than the container plane it is meant to be sitting inside.
            pushPasswordManagerStrategy="none"
            containerClassName="group flex items-center"
            render={({ slots }) => (
              // z 1 — the slot row, lifted to the middle plane.
              <div
                className={cn(
                  'otp-iso-slots flex',
                  dim('slots') && 'opacity-25',
                )}
              >
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

          {/* z 2 — the input's plane, outlined so it reads as a sheet even
              when the value is short. */}
          <div
            aria-hidden
            className={cn(
              'otp-iso-plane-outline pointer-events-none absolute rounded-sm border border-dashed border-amber-400/50 bg-amber-400/[0.05] transition-opacity duration-300',
              dim('input') && 'opacity-20',
            )}
            style={{
              inset: 0,
              width: SLOT_W * 6,
              height: SLOT_H,
              opacity: tilt || reveal ? undefined : 0,
            }}
          />

          {/* The input plane's shadow on the floor — the cue that reads as
              "this sheet is hovering above that one". */}
          {tilt && separation > 8 && (
            <div
              aria-hidden
              className="pointer-events-none absolute rounded-sm border border-dashed border-amber-400/20"
              style={{ inset: 0, width: SLOT_W * 6, height: SLOT_H }}
            />
          )}
        </div>
      </div>

      {/* ————— Layers ————— */}
      <div className="border-t border-border/70 px-4 py-4 sm:px-5">
        <p className="mb-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
          Paint order — bottom to top
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {LAYERS.map(layer => (
            <LayerChip
              key={layer.id}
              tone={layer.tone}
              z={layer.z}
              title={layer.title}
              active={focused === null || focused === layer.id}
              onClick={() => setFocused(focused === layer.id ? null : layer.id)}
            >
              {focused === null ? layer.blurb.split('.')[0] + '.' : null}
            </LayerChip>
          ))}
        </div>

        {active && (
          <div className="mt-3.5">
            <p className="max-w-2xl text-[0.875rem] leading-6 text-muted-foreground">
              {active.blurb}
            </p>
            <pre className="mt-2.5 overflow-x-auto font-mono text-[0.6875rem] leading-5 text-amber-200/70">
              {active.code}
            </pre>
          </div>
        )}

        {!active && (
          <p className="mt-3 text-[0.8125rem] leading-6 text-muted-foreground">
            Pick a layer to isolate it. The field stays live in every view —
            click into the tilted board and type.
          </p>
        )}
      </div>
    </div>
  )
}
