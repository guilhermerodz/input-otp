'use client'

import * as React from 'react'
import { OTPInput } from 'input-otp'

import { cn } from '@/lib/utils'
import { Slot } from '@/components/ui/otp-slot'
import { FakeBadge } from './fake-badge'
import {
  PASSWORD_MANAGERS_SELECTORS,
  PWM_BADGE_MARGIN_RIGHT,
  PWM_BADGE_SPACE_WIDTH_PX,
  VENDORS,
  type VendorId,
} from './vendors'

type Strategy = 'increase-width' | 'none'

interface Geometry {
  /** Badge offset from the wrapper's right edge, in px. */
  badgeRight: number
  badgeTop: number
  /** The probe point, in wrapper-relative px. */
  probeX: number
  probeY: number
  /** Width of the reserved gutter drawn to the right of the container. */
  gutterLeft: number
  inputWidth: number
  containerWidth: number
}

interface Truth {
  /** The inline width the library computed for the real input. */
  width: string
  /** The clip-path that hides the reserved gutter. */
  clipPath: string
  /** How many elements the library's own selector list matches right now. */
  matches: number
  /** What `document.elementFromPoint` returns at the probe point. */
  probeHit: string
}

/**
 * The password manager badge, simulated.
 *
 * Install a fake extension, focus the field, and watch the real library react:
 * the invisible input grows by 40px and clips the overflow, which walks the
 * badge off the last slot without moving a single pixel of your UI.
 */
export function PwmSimulator() {
  const [vendor, setVendor] = React.useState<VendorId | null>('1password')
  const [strategy, setStrategy] = React.useState<Strategy>('increase-width')
  const [showProbe, setShowProbe] = React.useState(false)
  const [value, setValue] = React.useState('482')

  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const [geometry, setGeometry] = React.useState<Geometry | null>(null)
  const [truth, setTruth] = React.useState<Truth | null>(null)

  // Detection is latched (`done`) and only runs while the field is focused, so
  // changing a setting has to start the whole dance over — remount the input.
  const runKey = `${vendor ?? 'none'}:${strategy}`

  React.useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const measure = () => {
      const container = wrapper.querySelector<HTMLElement>(
        '[data-input-otp-container]',
      )
      const input = wrapper.querySelector<HTMLInputElement>('[data-input-otp]')
      if (!container || !input) return

      const wrapperRect = wrapper.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const inputRect = input.getBoundingClientRect()

      // Where the library looks: the container's right edge, 18px in,
      // vertically centred.
      const probeAbsX =
        containerRect.left + container.offsetWidth - PWM_BADGE_MARGIN_RIGHT
      const probeAbsY = containerRect.top + containerRect.height / 2

      const nextGeometry: Geometry = {
        // Real badges hug the right end of the field they're attached to.
        badgeRight: Math.round(wrapperRect.right - inputRect.right + 6),
        badgeTop: Math.round(
          inputRect.top - wrapperRect.top + inputRect.height / 2 - 12,
        ),
        probeX: Math.round(probeAbsX - wrapperRect.left),
        probeY: Math.round(probeAbsY - wrapperRect.top),
        gutterLeft: Math.round(containerRect.right - wrapperRect.left),
        inputWidth: Math.round(inputRect.width),
        containerWidth: Math.round(containerRect.width),
      }
      const nextTruth: Truth = {
        width: input.style.width || '100%',
        clipPath: input.style.clipPath || 'none',
        matches: document.querySelectorAll(PASSWORD_MANAGERS_SELECTORS).length,
        probeHit: describeElement(
          document.elementFromPoint(probeAbsX, probeAbsY),
        ),
      }

      // Polling three times a second, so only re-render when something moved.
      setGeometry(prev => (same(prev, nextGeometry) ? prev : nextGeometry))
      setTruth(prev => (same(prev, nextTruth) ? prev : nextTruth))
    }

    measure()

    // Measured on a plain interval rather than a rAF loop: the library flips the
    // width from a timeout chain (0ms / 2s / 5s), and rAF is throttled to a halt
    // in a background tab — which is exactly where the readout would go stale.
    const interval = setInterval(measure, 350)
    const observer = new ResizeObserver(measure)
    observer.observe(wrapper)
    const input = wrapper.querySelector<HTMLElement>('[data-input-otp]')
    if (input) observer.observe(input)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, { passive: true })

    return () => {
      clearInterval(interval)
      observer.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure)
    }
  }, [runKey])

  const pushed = truth ? truth.width !== '100%' : false

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-border/70">
      {/* ————— Controls ————— */}
      <div className="flex flex-col gap-4 border-b border-border/70 bg-muted/20 px-4 py-4 sm:px-5">
        <Control label="Installed extension">
          <Segmented
            options={[
              { value: 'none', label: 'None' },
              ...VENDORS.map(v => ({ value: v.id, label: v.label })),
            ]}
            value={vendor ?? 'none'}
            onChange={next =>
              setVendor(next === 'none' ? null : (next as VendorId))
            }
          />
        </Control>

        <Control label="pushPasswordManagerStrategy">
          <Segmented
            options={[
              { value: 'increase-width', label: 'increase-width' },
              { value: 'none', label: 'none' },
            ]}
            value={strategy}
            onChange={next => setStrategy(next as Strategy)}
            mono
          />
        </Control>

        <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={showProbe}
            onChange={e => setShowProbe(e.target.checked)}
            className="h-3.5 w-3.5 accent-foreground"
          />
          Show the detection probe point
        </label>
      </div>

      {/* ————— Stage ————— */}
      <div className="bg-dot-grid relative flex min-h-[13rem] items-center justify-center overflow-hidden px-6 py-12">
        <div ref={wrapperRef} className="relative">
          <OTPInput
            key={runKey}
            maxLength={6}
            value={value}
            onChange={setValue}
            pushPasswordManagerStrategy={strategy}
            containerClassName="group flex items-center"
            render={({ slots }) => (
              <div className="flex">
                {slots.map((slot, idx) => (
                  <Slot key={idx} {...slot} />
                ))}
              </div>
            )}
          />

          {/* The 40px of width the library reserves, drawn so you can see it. */}
          {geometry && pushed && (
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 h-full rounded-r border border-l-0 border-dashed border-emerald-400/50 bg-emerald-400/[0.07]"
              style={{
                left: geometry.gutterLeft,
                width: PWM_BADGE_SPACE_WIDTH_PX,
              }}
            >
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[0.625rem] text-emerald-400/90">
                +{PWM_BADGE_SPACE_WIDTH_PX}px
              </span>
            </div>
          )}

          {vendor && geometry && (
            <FakeBadge
              vendor={vendor}
              offsetRight={geometry.badgeRight}
              top={geometry.badgeTop}
            />
          )}

          {showProbe && geometry && (
            <div
              aria-hidden
              className="pointer-events-none absolute z-[70]"
              style={{ left: geometry.probeX, top: geometry.probeY }}
            >
              <span className="absolute -left-2 -top-px block h-px w-4 bg-sky-400" />
              <span className="absolute -top-2 -left-px block h-4 w-px bg-sky-400" />
              {/* Below the field, so it doesn't sit under the badge it's probing. */}
              <span className="absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap rounded bg-sky-500/15 px-1.5 py-px font-mono text-[0.5625rem] text-sky-300">
                elementFromPoint
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ————— Instrument readout ————— */}
      <dl className="divide-y divide-border/60 border-t border-border/70 font-mono text-[0.6875rem] sm:text-xs">
        <Readout label="querySelectorAll(…).length">
          {truth?.matches ?? '—'}
          <Hint>
            {truth?.matches
              ? 'a known vendor was found by name'
              : 'no vendor matched — falls back to the probe'}
          </Hint>
        </Readout>
        <Readout label="elementFromPoint(x, y)">
          {truth?.probeHit ?? '—'}
        </Readout>
        <Readout label="input.style.width">{truth?.width ?? '—'}</Readout>
        <Readout label="input.style.clipPath">{truth?.clipPath ?? '—'}</Readout>
        <Readout label="rendered widths">
          container {geometry?.containerWidth ?? '—'}px · input{' '}
          {geometry?.inputWidth ?? '—'}px
        </Readout>
        <Readout label="verdict">
          <span
            className={cn(
              'rounded px-1.5 py-0.5',
              pushed
                ? 'bg-emerald-500/15 text-emerald-300'
                : 'bg-muted/60 text-muted-foreground',
            )}
          >
            {pushed
              ? 'badge pushed out of the last slot'
              : 'no gutter reserved — badge overlaps the last slot'}
          </span>
        </Readout>
      </dl>
    </div>
  )
}

/** Shallow structural equality — both readings are flat records. */
function same<T extends object>(a: T | null, b: T) {
  if (!a) return false
  return (Object.keys(b) as (keyof T)[]).every(key => a[key] === b[key])
}

function describeElement(el: Element | null) {
  if (!el) return 'null'
  const badge = el.closest('[data-fake-pwm-badge]')
  if (badge) return `<${badge.tagName.toLowerCase()}> (the badge)`

  const tag = el.tagName.toLowerCase()
  if (el.hasAttribute('data-input-otp')) {
    return `<${tag} data-input-otp> (the input)`
  }
  if (el.hasAttribute('data-input-otp-container')) {
    return `<${tag}> (the container)`
  }
  return `<${tag}>`
}

function Control({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <span className="shrink-0 font-mono text-[0.6875rem] text-muted-foreground/80 sm:w-[15rem]">
        {label}
      </span>
      {children}
    </div>
  )
}

function Segmented({
  options,
  value,
  onChange,
  mono,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (next: string) => void
  mono?: boolean
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-md border border-border/70 bg-background/60 p-0.5">
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded px-2 py-1 text-xs transition-colors duration-150',
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

function Readout({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 gap-1 px-4 py-2 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:gap-4 sm:px-5">
      <dt className="text-muted-foreground/70">{label}</dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  )
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-2 font-sans text-[0.6875rem] text-muted-foreground/60">
      — {children}
    </span>
  )
}
